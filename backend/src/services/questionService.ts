import { neo4jConnection } from '../db/neo4j';
import { Record } from 'neo4j-driver';
import { Question, Category, Trait, Recording } from './storyService';

export class QuestionService {
  async getAllQuestions(): Promise<Question[]> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (q:Question)
        RETURN q
        ORDER BY q.text
      `);
      return result.records.map((record: Record) => record.get('q').properties);
    } finally {
      await session.close();
    }
  }

  async getQuestionById(id: string): Promise<Question | null> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (q:Question {id: $id})
        RETURN q
      `, { id });
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('q').properties;
    } finally {
      await session.close();
    }
  }

  async getQuestionCategories(questionId: string): Promise<Category[]> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (q:Question {id: $questionId})-[:TESTS_FOR]->(c:Category)
        RETURN c
        ORDER BY c.name
      `, { questionId });
      
      return result.records.map((record: Record) => record.get('c').properties);
    } finally {
      await session.close();
    }
  }

  async getQuestionTraits(questionId: string): Promise<Trait[]> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (q:Question {id: $questionId})-[:TESTS_FOR]->(t:Trait)
        RETURN t
        ORDER BY t.name
      `, { questionId });
      
      return result.records.map((record: Record) => record.get('t').properties);
    } finally {
      await session.close();
    }
  }

  async getQuestionRecordings(questionId: string): Promise<Recording[]> {
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
} 