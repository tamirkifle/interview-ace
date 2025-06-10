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
      const result = await session.run(`
        MATCH (q:Question {id: $questionId})-[:TESTS_FOR]->(c:Category)
        MATCH (s:Story)-[:BELONGS_TO]->(c)
        WITH s, q, count(c) as categoryMatches
        MATCH (q)-[:TESTS_FOR]->(t:Trait)
        MATCH (s)-[:DEMONSTRATES]->(t)
        WITH s, q, categoryMatches, count(t) as traitMatches
        WITH s, q, categoryMatches, traitMatches,
             (categoryMatches + traitMatches) * 1.0 / 5 as relevanceScore
        MATCH (s)-[:BELONGS_TO]->(c:Category)
        MATCH (s)-[:DEMONSTRATES]->(t:Trait)
        WITH s, relevanceScore, collect(DISTINCT c) as matchedCategories, collect(DISTINCT t) as matchedTraits
        RETURN s, relevanceScore, matchedCategories, matchedTraits
        ORDER BY relevanceScore DESC
        LIMIT $limit
      `, { questionId, limit });
      
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
        ` : ''}
        RETURN s
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
      
      return {
        ...result.records[0].get('s').properties,
        categories: [],
        traits: [],
        recordings: []
      };
    } finally {
      await session.close();
    }
  }
} 