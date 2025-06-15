import { neo4jConnection } from '../db/neo4j';
import { Record } from 'neo4j-driver';
import { Category } from './storyService';

export class CategoryService {
  async getAllCategories(): Promise<Category[]> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (c:Category)
        RETURN c
        ORDER BY c.name
      `);
      return result.records.map((record: Record) => record.get('c').properties);
    } finally {
      await session.close();
    }
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (c:Category {id: $id})
        RETURN c
      `, { id });
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('c').properties;
    } finally {
      await session.close();
    }
  }

  async getCategoriesByIds(ids: string[]): Promise<Category[]> {
    if (!ids || ids.length === 0) return [];
    
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (c:Category)
        WHERE c.id IN $ids
        RETURN c
        ORDER BY c.name
      `, { ids });
      
      return result.records.map((record: Record) => record.get('c').properties);
    } finally {
      await session.close();
    }
  }

  async getCategoryStories(categoryId: string): Promise<any[]> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (s:Story)-[:BELONGS_TO]->(c:Category {id: $categoryId})
        RETURN s
        ORDER BY s.createdAt DESC
      `, { categoryId });
      
      return result.records.map((record: Record) => record.get('s').properties);
    } finally {
      await session.close();
    }
  }

  async getCategoryQuestions(categoryId: string): Promise<any[]> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (q:Question)-[:TESTS_FOR]->(c:Category {id: $categoryId})
        RETURN q
        ORDER BY q.text
      `, { categoryId });
      
      return result.records.map((record: Record) => record.get('q').properties);
    } finally {
      await session.close();
    }
  }
} 