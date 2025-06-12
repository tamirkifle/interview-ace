import { neo4jConnection } from '../db/neo4j';
import { Record } from 'neo4j-driver';

export interface Story {
  id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Trait {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  text: string;
  difficulty: string;
  commonality: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Recording {
  id: string;
  filename: string;
  duration: number;
  minio_key: string;
  createdAt: Date;
}

export interface StoryMatch {
  story: Story;
  relevanceScore: number;
  matchedCategories: Category[];
  matchedTraits: Trait[];
}

export class StoryService {
  async getAllStories(): Promise<Story[]> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (s:Story)
        RETURN s
        ORDER BY s.createdAt DESC
      `);
      return result.records.map((record: Record) => {
        const props = record.get('s').properties;
        // Convert Neo4j date values to ISO strings
        const createdAt = props.createdAt instanceof Date ? props.createdAt.toISOString() : new Date(props.createdAt).toISOString();
        const updatedAt = props.updatedAt instanceof Date ? props.updatedAt.toISOString() : new Date(props.updatedAt).toISOString();
        
        return {
          ...props,
          createdAt,
          updatedAt
        };
      });
    } finally {
      await session.close();
    }
  }

  async getStoryById(id: string): Promise<Story | null> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (s:Story {id: $id})
        RETURN s
      `, { id });
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('s').properties;
    } finally {
      await session.close();
    }
  }

  async getStoryCategories(storyId: string): Promise<Category[]> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (s:Story {id: $storyId})-[:BELONGS_TO]->(c:Category)
        RETURN c
        ORDER BY c.name
      `, { storyId });
      
      return result.records.map((record: Record) => record.get('c').properties);
    } finally {
      await session.close();
    }
  }

  async getStoryTraits(storyId: string): Promise<Trait[]> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (s:Story {id: $storyId})-[:DEMONSTRATES]->(t:Trait)
        RETURN t
        ORDER BY t.name
      `, { storyId });
      
      return result.records.map((record: Record) => record.get('t').properties);
    } finally {
      await session.close();
    }
  }

  async getStoryRecordings(storyId: string): Promise<Recording[]> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (r:Recording)-[:RECORDS]->(s:Story {id: $storyId})
        RETURN r
        ORDER BY r.createdAt DESC
      `, { storyId });
      
      return result.records.map((record: Record) => record.get('r').properties);
    } finally {
      await session.close();
    }
  }

  async findMatchingStories(questionId: string, limit: number = 5): Promise<StoryMatch[]> {
    const session = await neo4jConnection.getSession();
    try {
      const intLimit = Math.floor(Math.max(1, Number(limit)));
      
      const result = await session.run(`
        // Get all stories and calculate their relevance to this question
        MATCH (q:Question {id: $questionId})
        MATCH (s:Story)
        
        // Get question's categories and traits
        OPTIONAL MATCH (q)-[:TESTS_FOR]->(qc:Category)
        OPTIONAL MATCH (q)-[:TESTS_FOR]->(qt:Trait)
        WITH q, s, collect(DISTINCT qc) as questionCategories, collect(DISTINCT qt) as questionTraits
        
        // Get story's categories and traits  
        OPTIONAL MATCH (s)-[:BELONGS_TO]->(sc:Category)
        OPTIONAL MATCH (s)-[:DEMONSTRATES]->(st:Trait)
        WITH q, s, questionCategories, questionTraits,
             collect(DISTINCT sc) as storyCategories, collect(DISTINCT st) as storyTraits
        
        // Find intersections
        WITH q, s, questionCategories, questionTraits, storyCategories, storyTraits,
             [c IN storyCategories WHERE c IN questionCategories] as matchedCategories,
             [t IN storyTraits WHERE t IN questionTraits] as matchedTraits
        
        // Calculate scores
        WITH s, matchedCategories, matchedTraits,
             size(matchedCategories) as categoryMatches,
             size(matchedTraits) as traitMatches,
             size(questionCategories) as totalQuestionCategories,
             size(questionTraits) as totalQuestionTraits
        
        // Calculate relevance score
        WITH s, matchedCategories, matchedTraits, categoryMatches, traitMatches,
             totalQuestionCategories, totalQuestionTraits,
             CASE WHEN totalQuestionCategories > 0 
                  THEN (categoryMatches * 1.0 / totalQuestionCategories) * 0.7 
                  ELSE 0.0 END +
             CASE WHEN totalQuestionTraits > 0 
                  THEN (traitMatches * 1.0 / totalQuestionTraits) * 0.3 
                  ELSE 0.0 END as relevanceScore
        
        // Return stories sorted by relevance
        RETURN s, relevanceScore, matchedCategories, matchedTraits
        ORDER BY relevanceScore DESC, categoryMatches DESC, traitMatches DESC
        LIMIT toInteger($limit)
      `, { questionId, limit: intLimit });
      
      return result.records.map((record: Record) => ({
        story: record.get('s').properties,
        relevanceScore: record.get('relevanceScore'),
        matchedCategories: record.get('matchedCategories').map((c: any) => c.properties),
        matchedTraits: record.get('matchedTraits').map((t: any) => t.properties)
      }));
    } finally {
      await session.close();
    }
  }

  async createStory(input: {
    title: string;
    situation: string;
    task: string;
    action: string;
    result: string;
    categoryIds?: string[];
  }): Promise<Story> {
    const session = await neo4jConnection.getSession();
    try {
      const id = `story-${Date.now()}`;
      const now = new Date().toISOString();
      
      const result = await session.run(`
        CREATE (s:Story {
          id: $id,
          title: $title,
          situation: $situation,
          task: $task,
          action: $action,
          result: $result,
          createdAt: $createdAt,
          updatedAt: $updatedAt
        })
        ${input.categoryIds && input.categoryIds.length > 0 ? `
        WITH s
        MATCH (c:Category)
        WHERE c.id IN $categoryIds
        MERGE (s)-[:BELONGS_TO]->(c)
        
        // Automatically create ANSWERS relationships with questions that share categories
        WITH s
        MATCH (s)-[:BELONGS_TO]->(cat:Category)<-[:TESTS_FOR]-(q:Question)
        MERGE (s)-[:ANSWERS]->(q)
        
        // Return story with its categories
        WITH s
        MATCH (s)-[:BELONGS_TO]->(c:Category)
        RETURN s, collect(c) as categories
        ` : `
        RETURN s, [] as categories
        `}
      `, {
        id,
        title: input.title,
        situation: input.situation,
        task: input.task,
        action: input.action,
        result: input.result,
        createdAt: now,
        updatedAt: now,
        categoryIds: input.categoryIds || []
      });
      
      const storyRecord = result.records[0];
      const story = storyRecord.get('s').properties;
      const categories = storyRecord.get('categories')?.map((c: any) => c.properties) || [];
      
      return {
        ...story,
        categories,
        traits: [],
        recordings: []
      };
    } finally {
      await session.close();
    }
  }

  async getStoryQuestions(storyId: string): Promise<Question[]> {
    const session = await neo4jConnection.getSession();
    try {
      const result = await session.run(`
        MATCH (s:Story {id: $storyId})-[:ANSWERS]->(q:Question)
        RETURN q
        ORDER BY q.text
      `, { storyId });
      
      return result.records.map((record: Record) => record.get('q').properties);
    } finally {
      await session.close();
    }
  }
} 