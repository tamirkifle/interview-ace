import { neo4jConnection } from '../db/neo4j';
import { Record } from 'neo4j-driver';
import { Recording, Story, Question } from './storyService';

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

  async createRecording(data: {
    filename: string;
    duration: number;
    minio_key: string;
    storyId?: string;
    questionId: string;
  }): Promise<Recording> {
    const session = await neo4jConnection.getSession();
    try {
      const id = `rec-${Date.now()}`;
      const result = await session.run(`
        CREATE (r:Recording {
          id: $id,
          filename: $filename,
          duration: $duration,
          minio_key: $minio_key,
          createdAt: datetime()
        })
        WITH r
        MATCH (q:Question {id: $questionId})
        MERGE (r)-[:ANSWERS]->(q)
        ${data.storyId ? `
        WITH r
        MATCH (s:Story {id: $storyId})
        MERGE (r)-[:RECORDS]->(s)
        ` : ''}
        RETURN r
      `, { ...data, id });
      
      return result.records[0].get('r').properties;
    } finally {
      await session.close();
    }
  }
} 