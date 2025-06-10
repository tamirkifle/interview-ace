import { neo4jConnection } from '../db/neo4j';
import { Record } from 'neo4j-driver';
import { Trait } from './storyService';

export class TraitService {
  async getAllTraits(): Promise<Trait[]> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (t:Trait)
        RETURN t
        ORDER BY t.name
      `);
      return result.records.map((record: Record) => record.get('t').properties);
    } finally {
      await session.close();
    }
  }

  async getTraitById(id: string): Promise<Trait | null> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (t:Trait {id: $id})
        RETURN t
      `, { id });
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('t').properties;
    } finally {
      await session.close();
    }
  }

  async getTraitStories(traitId: string): Promise<any[]> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (s:Story)-[:DEMONSTRATES]->(t:Trait {id: $traitId})
        RETURN s
        ORDER BY s.createdAt DESC
      `, { traitId });
      
      return result.records.map((record: Record) => record.get('s').properties);
    } finally {
      await session.close();
    }
  }

  async getTraitQuestions(traitId: string): Promise<any[]> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (q:Question)-[:TESTS_FOR]->(t:Trait {id: $traitId})
        RETURN q
        ORDER BY q.text
      `, { traitId });
      
      return result.records.map((record: Record) => record.get('q').properties);
    } finally {
      await session.close();
    }
  }
} 