import { neo4jConnection } from '../db/neo4j';
import { Record } from 'neo4j-driver';
import { Recording, Story, Question } from './storyService';
import { v4 as uuidv4 } from 'uuid';

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

  async createRecording(input: CreateRecordingData): Promise<Recording> {
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
        timestamp
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
            createdAt: datetime($timestamp)
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
            createdAt: datetime($timestamp)
          })
          CREATE (r)-[:ANSWERS]->(q)
          RETURN r
        `;
      }
  
      const result = await session.run(query, params);
  
      if (result.records.length === 0) {
        throw new Error('Failed to create recording - question or story not found');
      }
  
      return result.records[0].get('r').properties;
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
}