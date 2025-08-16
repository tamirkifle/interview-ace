import { neo4jConnection } from '../db/neo4j';
import { Record } from 'neo4j-driver';
import { Question, Category, Trait, Recording, Job } from './storyService';
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
  
  async getQuestionJob(questionId: string): Promise<Job | null> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(
        `
        MATCH (q:Question {id: $questionId})-[:GENERATED_FOR_JOB]->(j:Job)
        RETURN j
        `,
        { questionId }
      );
      if (result.records.length === 0) {
        return null;
      }
      return result.records[0].get('j').properties;
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
    reasoning?: string;
  }): Promise<Question> {
    const session = await neo4jConnection.getSession();
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      const createResult = await session.run(
        `
        CREATE (q:Question {
          id: $id,
          text: $text,
          difficulty: $difficulty,
          commonality: $commonality,
          source: $source,
          reasoning: $reasoning,
          createdAt: $createdAt,
          updatedAt: $updatedAt
        })
        RETURN q
        `,
        {
          id,
          text: input.text,
          difficulty: input.difficulty,
          commonality: input.commonality,
          source: input.source || 'custom',
          reasoning: input.reasoning,
          createdAt: now,
          updatedAt: now,
        }
      );
      
      const newQuestion = createResult.records[0].get('q').properties;
      
      // Connect to categories
      if (input.categoryIds.length > 0) {
        await session.run(
          `
          MATCH (q:Question {id: $id})
          UNWIND $categoryIds AS categoryId
          MATCH (c:Category {id: categoryId})
          CREATE (q)-[:TESTS_FOR]->(c)
          `,
          { id, categoryIds: input.categoryIds }
        );
      }
      
      // Connect to traits
      if (input.traitIds.length > 0) {
        await session.run(
          `
          MATCH (q:Question {id: $id})
          UNWIND $traitIds AS traitId
          MATCH (t:Trait {id: traitId})
          CREATE (q)-[:TESTS_FOR]->(t)
          `,
          { id, traitIds: input.traitIds }
        );
      }
        
      return newQuestion;
    } finally {
      await session.close();
    }
  }

  async linkQuestionToJob(questionId: string, jobId: string): Promise<void> {
    const session = await neo4jConnection.getSession();
    try {
      await session.run(
        `
        MATCH (q:Question {id: $questionId})
        MATCH (j:Job {id: $jobId})
        MERGE (q)-[:GENERATED_FOR_JOB]->(j)
        `,
        { questionId, jobId }
      );
    } finally {
      await session.close();
    }
  }

  async updateQuestion(id: string, text: string): Promise<Question> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(
        `
        MATCH (q:Question {id: $id})
        SET q.text = $text,
            q.updatedAt = datetime()
        RETURN q
        `,
        { id, text }
      );
      if (result.records.length === 0) {
        throw new Error('Question not found');
      }
  
      return result.records[0].get('q').properties;
    } finally {
      await session.close();
    }
  }
  
  async deleteQuestions(ids: string[]): Promise<number> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(
        `
        MATCH (q:Question)
        WHERE q.id IN $ids
        DETACH DELETE q
        RETURN count(q) as deletedCount
        `,
        { ids }
      );
      return result.records[0].get('deletedCount').toNumber();
    } finally {
      await session.close();
    }
  }

  async updateQuestionFull(id: string, input: {
    text: string;
    difficulty: string;
    categoryIds: string[];
    traitIds: string[];
  }): Promise<Question> {
    const session = await neo4jConnection.getSession();
    try {
      // First, update the question and remove all existing relationships
      await session.run(
        `
        MATCH (q:Question {id: $id})
        SET q.text = $text,
            q.difficulty = $difficulty,
            q.updatedAt = datetime()
        WITH q
        OPTIONAL MATCH (q)-[r:TESTS_FOR]->()
        DELETE r
        `,
        { 
          id, 
          text: input.text,
          difficulty: input.difficulty
        }
      );
      // Then, create new relationships
      if (input.categoryIds.length > 0) {
        await session.run(
          `
          MATCH (q:Question {id: $id})
          UNWIND $categoryIds AS categoryId
          MATCH (c:Category {id: categoryId})
          CREATE (q)-[:TESTS_FOR]->(c)
          `,
          { id, categoryIds: input.categoryIds }
        );
      }
  
      if (input.traitIds.length > 0) {
        await session.run(
          `
          MATCH (q:Question {id: $id})
          UNWIND $traitIds AS traitId
          MATCH (t:Trait {id: traitId})
          CREATE (q)-[:TESTS_FOR]->(t)
          `,
          { id, traitIds: input.traitIds }
        );
      }
  
      // Return the updated question
      const result = await session.run(
        `
        MATCH (q:Question {id: $id})
        RETURN q
        `,
        { id }
      );
      if (result.records.length === 0) {
        throw new Error('Question not found');
      }
  
      return result.records[0].get('q').properties;
    } finally {
      await session.close();
    }
  }
}