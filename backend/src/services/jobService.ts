import { neo4jConnection } from '../db/neo4j';
import { Record } from 'neo4j-driver';
import { Job } from './storyService';
import { Question } from './storyService';
import { v4 as uuidv4 } from 'uuid';

export class JobService {
    async createOrFindJob(input: {
      company: string;
      title: string;
      description: string;
    }): Promise<Job> {
      const session = await neo4jConnection.getSession();
      try {
        const result = await session.run(
          `
          MERGE (j:Job {company: $company, title: $title})
          ON CREATE SET j.id = $id,
                        j.description = $description,
                        j.createdAt = datetime(),
                        j.updatedAt = datetime()
          ON MATCH SET j.description = $description,
                       j.updatedAt = datetime()
          RETURN j
          `,
          { 
            company: input.company, 
            title: input.title, 
            description: input.description,
            id: uuidv4()
          }
        );
        return result.records[0].get('j').properties;
      } finally {
        await session.close();
      }
    }

    async getJobById(id: string): Promise<Job | null> {
      const session = await neo4jConnection.getSession();
      try {
        const result = await session.run(
          `
          MATCH (j:Job {id: $id})
          RETURN j
          `,
          { id }
        );
        if (result.records.length === 0) {
          return null;
        }
        return result.records[0].get('j').properties;
      } finally {
        await session.close();
      }
    }

    async getJobQuestions(jobId: string): Promise<Question[]> {
      const session = await neo4jConnection.getSession();
      try {
        const result = await session.run(
          `
          MATCH (j:Job {id: $jobId})<-[:GENERATED_FOR_JOB]-(q:Question)
          RETURN q
          ORDER BY q.createdAt DESC
          `,
          { jobId }
        );
        return result.records.map((record: Record) => record.get('q').properties);
      } finally {
        await session.close();
      }
    }
    
    async getQuestionsForCompany(company: string): Promise<Question[]> {
      const session = await neo4jConnection.getSession();
      try {
        const result = await session.run(
          `
          MATCH (j:Job {company: $company})<-[:GENERATED_FOR_JOB]-(q:Question)
          RETURN q
          ORDER BY q.createdAt DESC
          `,
          { company }
        );
        return result.records.map((record: Record) => record.get('q').properties);
      } finally {
        await session.close();
      }
    }
}