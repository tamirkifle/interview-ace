import { neo4jConnection } from '../db/neo4j';
import { Record } from 'neo4j-driver';
import { Question, Category, Trait, Recording } from './storyService';
import { v4 as uuidv4 } from 'uuid';

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

  async findByText(text: string): Promise<Question | null> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(
        `
        MATCH (q:Question)
        WHERE toLower(q.text) = toLower($text)
        RETURN q
        LIMIT 1
        `,
        { text }
      );
  
      if (result.records.length === 0) {
        return null;
      }
  
      return result.records[0].get('q').properties;
    } finally {
      await session.close();
    }
  }
  
  async createQuestion(input: {
    text: string;
    categoryIds: string[];
    traitIds: string[];
    difficulty: string;
    commonality: number;
    source?: string;
  }): Promise<Question> {
    const session = await neo4jConnection.getSession();
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
  
      const result = await session.run(
        `
        CREATE (q:Question {
          id: $id,
          text: $text,
          difficulty: $difficulty,
          commonality: $commonality,
          source: $source,
          createdAt: $createdAt,
          updatedAt: $updatedAt
        })
        WITH q
        
        // Connect to categories
        UNWIND CASE WHEN size($categoryIds) > 0 THEN $categoryIds ELSE [null] END AS categoryId
        WITH q, categoryId
        WHERE categoryId IS NOT NULL
        MATCH (c:Category {id: categoryId})
        CREATE (q)-[:TESTS_FOR]->(c)
        
        WITH DISTINCT q
        
        // Connect to traits  
        UNWIND CASE WHEN size($traitIds) > 0 THEN $traitIds ELSE [null] END AS traitId
        WITH q, traitId
        WHERE traitId IS NOT NULL
        MATCH (t:Trait {id: traitId})
        CREATE (q)-[:TESTS_FOR]->(t)
        
        RETURN q
        `,
        {
          id,
          text: input.text,
          difficulty: input.difficulty,
          commonality: input.commonality,
          source: input.source || 'custom',
          createdAt: now,
          updatedAt: now,
          categoryIds: input.categoryIds,
          traitIds: input.traitIds
        }
      );
  
      return result.records[0].get('q').properties;
    } finally {
      await session.close();
    }
  }
} 