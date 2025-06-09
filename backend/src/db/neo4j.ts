import neo4j, { Driver, Session, Result } from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

class Neo4jConnection {
  private driver: Driver;
  private static instance: Neo4jConnection;

  private constructor() {
    const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
    const user = process.env.NEO4J_USER || 'neo4j';
    const password = process.env.NEO4J_PASSWORD || 'password123';

    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
      maxConnectionPoolSize: 50,
      connectionAcquisitionTimeout: 30000,
      disableLosslessIntegers: true
    });
  }

  public static getInstance(): Neo4jConnection {
    if (!Neo4jConnection.instance) {
      Neo4jConnection.instance = new Neo4jConnection();
    }
    return Neo4jConnection.instance;
  }

  public async verifyConnectivity(): Promise<boolean> {
    try {
      await this.driver.verifyConnectivity();
      return true;
    } catch (error) {
      console.error('Neo4j connection verification failed:', error);
      return false;
    }
  }

  public async getSession(): Promise<Session> {
    return this.driver.session();
  }

  public async runQuery(query: string, params?: { [key: string]: any }): Promise<Result> {
    const session = await this.getSession();
    try {
      return await session.run(query, params);
    } finally {
      await session.close();
    }
  }

  public async close(): Promise<void> {
    await this.driver.close();
  }
}

// Export a singleton instance
export const neo4jConnection = Neo4jConnection.getInstance(); 