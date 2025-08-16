import { neo4jConnection } from '../db/neo4j';
import { Record } from 'neo4j-driver';

export interface Project {
  id: string; // Project name as ID
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ProjectService {
  async getProjectById(id: string): Promise<Project | null> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (p:Project {id: $id})
        RETURN p
      `, { id });
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('p').properties;
    } finally {
      await session.close();
    }
  }

  async getAllProjects(): Promise<Project[]> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (p:Project)
        RETURN p
        ORDER BY p.updatedAt DESC
      `);
      return result.records.map((record: Record) => record.get('p').properties);
    } finally {
      await session.close();
    }
  }

  async createOrUpdateProject(
    id: string, 
    newDescription: string,
    aiConsolidationFn?: (oldDesc: string, newDesc: string) => Promise<string>
  ): Promise<Project> {
    const session = await neo4jConnection.getSession();
    try {
      const existing = await this.getProjectById(id);
      const now = new Date().toISOString();
      
      let finalDescription = newDescription;
      
      if (existing && aiConsolidationFn) {
        finalDescription = await aiConsolidationFn(existing.description, newDescription);
      }
      
      const result = await session.run(`
        MERGE (p:Project {id: $id})
        ON CREATE SET p.createdAt = $updatedAt
        SET p.description = $description,
            p.updatedAt = $updatedAt
        RETURN p
      `, {
        id,
        description: finalDescription,
        updatedAt: now
      });
      
      return result.records[0].get('p').properties;
    } finally {
      await session.close();
    }
  }

  async getProjectQuestions(projectId: string): Promise<any[]> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (q:Question)-[:TESTS_FOR]->(p:Project {id: $projectId})
        RETURN q
        ORDER BY q.createdAt DESC
      `, { projectId });
      
      return result.records.map((record: Record) => record.get('q').properties);
    } finally {
      await session.close();
    }
  }
}