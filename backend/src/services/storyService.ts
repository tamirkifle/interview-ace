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
  // Helper method to normalize dates consistently
  private normalizeDates(props: any): any {
    const normalized = { ...props };
    
    if (props.createdAt) {
      normalized.createdAt = props.createdAt instanceof Date 
        ? props.createdAt.toISOString() 
        : new Date(props.createdAt).toISOString();
    }
    
    if (props.updatedAt) {
      normalized.updatedAt = props.updatedAt instanceof Date 
        ? props.updatedAt.toISOString() 
        : new Date(props.updatedAt).toISOString();
    }
    
    return normalized;
  }

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
        return this.normalizeDates(props);
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
      
      const props = result.records[0].get('s').properties;
      return this.normalizeDates(props);
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
      
      return result.records.map((record: Record) => {
        const props = record.get('c').properties;
        return this.normalizeDates(props);
      });
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
      
      return result.records.map((record: Record) => {
        const props = record.get('t').properties;
        return this.normalizeDates(props);
      });
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
      
      return result.records.map((record: Record) => {
        const props = record.get('r').properties;
        return this.normalizeDates(props);
      });
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
        USING INDEX q:Question(id)
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
        story: this.normalizeDates(record.get('s').properties),
        relevanceScore: record.get('relevanceScore'),
        matchedCategories: record.get('matchedCategories').map((c: any) => this.normalizeDates(c.properties)),
        matchedTraits: record.get('matchedTraits').map((t: any) => this.normalizeDates(t.properties))
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
    traitIds?: string[];
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
        
        // Handle category relationships
        ${input.categoryIds && input.categoryIds.length > 0 ? `
        WITH s
        MATCH (c:Category)
        WHERE c.id IN $categoryIds
        MERGE (s)-[:BELONGS_TO]->(c)
        ` : ''}
        
        // Handle trait relationships
        ${input.traitIds && input.traitIds.length > 0 ? `
        WITH s
        MATCH (t:Trait)
        WHERE t.id IN $traitIds
        MERGE (s)-[:DEMONSTRATES]->(t)
        ` : ''}
        
        // Automatically create ANSWERS relationships with questions that share categories
        WITH s
        MATCH (s)-[:BELONGS_TO]->(cat:Category)<-[:TESTS_FOR]-(q:Question)
        MERGE (s)-[:ANSWERS]->(q)
        
        // Return story
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
        categoryIds: input.categoryIds || [],
        traitIds: input.traitIds || []
      });
      
      const storyRecord = result.records[0];
      const story = this.normalizeDates(storyRecord.get('s').properties);
      
      return story;
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
      
      return result.records.map((record: Record) => {
        const props = record.get('q').properties;
        return this.normalizeDates(props);
      });
    } finally {
      await session.close();
    }
  }
}