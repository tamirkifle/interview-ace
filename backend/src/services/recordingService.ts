import { neo4jConnection } from '../db/neo4j';
import { Record } from 'neo4j-driver';
import { Recording, Story, Question } from './storyService';
import { v4 as uuidv4 } from 'uuid';
import { transcriptionJobProcessor } from './transcription/jobProcessor';
import { TranscriptionContext } from './transcription/types';

export interface CreateRecordingData {
  questionId: string;
  storyId?: string;
  duration: number;
  filename: string;
  minioKey: string;
}

export class RecordingService {
  async getRecordingById(id: string): Promise<Recording | null> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (r:Recording {id: $id})
        RETURN r
      `, { id });
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('r').properties;
    } finally {
      await session.close();
    }
  }

  async getRecordingStory(recordingId: string): Promise<Story | null> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (r:Recording {id: $recordingId})-[:RECORDS]->(s:Story)
        RETURN s
      `, { recordingId });
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('s').properties;
    } finally {
      await session.close();
    }
  }

  async getRecordingQuestion(recordingId: string): Promise<Question | null> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (r:Recording {id: $recordingId})-[:ANSWERS]->(q:Question)
        RETURN q
      `, { recordingId });
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('q').properties;
    } finally {
      await session.close();
    }
  }

  async createRecording(
    input: CreateRecordingData, 
    transcriptionContext?: TranscriptionContext
  ): Promise<Recording> {
    const session = await neo4jConnection.getSession();
    try {
      const recordingId = uuidv4();
      const timestamp = new Date().toISOString();
  
      let query: string;
      let params: any = {
        recordingId,
        questionId: input.questionId,
        filename: input.filename,
        duration: input.duration,
        minioKey: input.minioKey,
        timestamp,
        // Initialize transcript fields
        transcriptStatus: transcriptionContext?.provider ? 'PENDING' : 'NONE'
      };
  
      if (input.storyId) {
        // If storyId is provided, create both relationships
        params.storyId = input.storyId;
        query = `
          MATCH (q:Question {id: $questionId})
          MATCH (s:Story {id: $storyId})
          CREATE (r:Recording {
            id: $recordingId,
            filename: $filename,
            duration: $duration,
            minio_key: $minioKey,
            createdAt: datetime($timestamp),
            transcriptStatus: $transcriptStatus
          })
          CREATE (r)-[:ANSWERS]->(q)
          CREATE (r)-[:RECORDS]->(s)
          RETURN r
        `;
      } else {
        // If no storyId, only create relationship to question
        query = `
          MATCH (q:Question {id: $questionId})
          CREATE (r:Recording {
            id: $recordingId,
            filename: $filename,
            duration: $duration,
            minio_key: $minioKey,
            createdAt: datetime($timestamp),
            transcriptStatus: $transcriptStatus
          })
          CREATE (r)-[:ANSWERS]->(q)
          RETURN r
        `;
      }
  
      const result = await session.run(query, params);
  
      if (result.records.length === 0) {
        throw new Error('Failed to create recording - question or story not found');
      }
  
      const recording = result.records[0].get('r').properties;

      // Queue transcription job if context provided
      if (transcriptionContext?.provider && (transcriptionContext?.apiKey || transcriptionContext.provider === 'local')) {
        // Process transcription asynchronously
        transcriptionJobProcessor.processRecording(
          recordingId,
          input.minioKey,
          transcriptionContext
        ).catch(error => {
          console.error('Failed to process transcription:', error);
        });
      }

      return recording;
    } catch (error) {
      console.error('Error creating recording:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Add this new method for getting recordings by question
  async getRecordingsByQuestion(questionId: string): Promise<Recording[]> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (r:Recording)-[:ANSWERS]->(q:Question {id: $questionId})
        RETURN r
        ORDER BY r.createdAt DESC
      `, { questionId });

      return result.records.map((record: Record) => record.get('r').properties);
    } finally {
      await session.close();
    }
  }

  // Add this new method for deleting recordings
  async deleteRecording(id: string): Promise<boolean> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (r:Recording {id: $id})
        DETACH DELETE r
        RETURN count(r) as deleted
      `, { id });

      const deleted = result.records[0].get('deleted').toNumber();
      return deleted > 0;
    } catch (error) {
      console.error('Error deleting recording:', error);
      return false;
    } finally {
      await session.close();
    }
  }

  // Add method to check transcription status
  async getRecordingTranscriptionStatus(id: string): Promise<string | null> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (r:Recording {id: $id})
        RETURN r.transcriptStatus as status
      `, { id });
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('status');
    } finally {
      await session.close();
    }
  }

  async getAllRecordings(filters?: {
    startDate?: Date;
    endDate?: Date;
    questionId?: string;
    storyId?: string;
  }): Promise<Recording[]> {
    const session = await neo4jConnection.getSession();
    try {
      let whereClause = '';
      const params: any = {};
  
      if (filters) {
        const conditions: string[] = [];
        
        if (filters.startDate) {
          conditions.push('r.createdAt >= $startDate');
          params.startDate = filters.startDate.toISOString();
        }
        
        if (filters.endDate) {
          conditions.push('r.createdAt <= $endDate');
          params.endDate = filters.endDate.toISOString();
        }
        
        if (filters.questionId) {
          conditions.push('q.id = $questionId');
          params.questionId = filters.questionId;
        }
        
        if (filters.storyId) {
          conditions.push('s.id = $storyId');
          params.storyId = filters.storyId;
        }
        
        if (conditions.length > 0) {
          whereClause = 'WHERE ' + conditions.join(' AND ');
        }
      }
  
      const result = await session.run(`
        MATCH (r:Recording)-[:ANSWERS]->(q:Question)
        OPTIONAL MATCH (r)-[:RECORDS]->(s:Story)
        ${whereClause}
        RETURN r
        ORDER BY r.createdAt DESC
      `, params);
      
      return result.records.map((record: Record) => record.get('r').properties);
    } finally {
      await session.close();
    }
  }

  async retryTranscription(
    recordingId: string, 
    transcriptionContext: TranscriptionContext
  ): Promise<Recording> {
    const session = await neo4jConnection.getSession();
    try {
      // First, get the recording to ensure it exists and get the minio_key
      const recordingResult = await session.run(`
        MATCH (r:Recording {id: $recordingId})
        RETURN r
      `, { recordingId });
      
      if (recordingResult.records.length === 0) {
        throw new Error('Recording not found');
      }
      
      const recording = recordingResult.records[0].get('r').properties;
      
      // Allow retranscription of any recording
      // For PENDING/PROCESSING, check if it's been stuck for too long (> 5 minutes)
      if (recording.transcriptStatus === 'PENDING' || recording.transcriptStatus === 'PROCESSING') {
        // Allow force retry - the user explicitly wants to restart
        console.log(`Force retrying transcription for recording ${recordingId} with status ${recording.transcriptStatus}`);
      }
      
      // Update status to PENDING
      const updateResult = await session.run(`
        MATCH (r:Recording {id: $recordingId})
        SET r.transcriptStatus = 'PENDING',
            r.transcript = null,
            r.transcriptedAt = null
        RETURN r
      `, { recordingId });
      
      const updatedRecording = updateResult.records[0].get('r').properties;
      
      // Queue transcription job
      if (transcriptionContext?.provider && (transcriptionContext?.apiKey || transcriptionContext.provider === 'local')) {
        transcriptionJobProcessor.processRecording(
          recordingId,
          recording.minio_key,
          transcriptionContext
        ).catch(error => {
          console.error('Failed to process transcription retry:', error);
        });
      } else {
        throw new Error('No transcription context provided');
      }
      
      return updatedRecording;
    } catch (error) {
      console.error('Error retrying transcription:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
}