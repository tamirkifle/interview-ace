import { neo4jConnection } from '../db/neo4j';
import { Record } from 'neo4j-driver';

export interface Experience {
  id: string; // Company_Role format
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ExperienceService {
  async getExperienceById(id: string): Promise<Experience | null> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (e:Experience {id: $id})
        RETURN e
      `, { id });
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('e').properties;
    } finally {
      await session.close();
    }
  }

  async getAllExperiences(): Promise<Experience[]> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (e:Experience)
        RETURN e
        ORDER BY e.updatedAt DESC
      `);
      return result.records.map((record: Record) => record.get('e').properties);
    } finally {
      await session.close();
    }
  }

  async createOrUpdateExperience(
    id: string, 
    newDescription: string,
    aiConsolidationFn?: (oldDesc: string, newDesc: string) => Promise<string>
  ): Promise<Experience> {
    const session = await neo4jConnection.getSession();
    try {
      const existing = await this.getExperienceById(id);
      const now = new Date().toISOString();
      
      let finalDescription = newDescription;
      
      if (existing && aiConsolidationFn) {
        finalDescription = await aiConsolidationFn(existing.description, newDescription);
      }
      
      const result = await session.run(`
        MERGE (e:Experience {id: $id})
        ON CREATE SET e.createdAt = $updatedAt
        SET e.description = $description,
            e.updatedAt = $updatedAt
        RETURN e
      `, {
        id,
        description: finalDescription,
        updatedAt: now
      });
      
      return result.records[0].get('e').properties;
    } finally {
      await session.close();
    }
  }

  async getExperienceQuestions(experienceId: string): Promise<any[]> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (q:Question)-[:TESTS_FOR]->(e:Experience {id: $experienceId})
        RETURN q
        ORDER BY q.createdAt DESC
      `, { experienceId });
      
      return result.records.map((record: Record) => record.get('q').properties);
    } finally {
      await session.close();
    }
  }
}