import { neo4jConnection } from '../../db/neo4j';
import neo4j from 'neo4j-driver';
import { dateTimeScalar } from '../schema/scalars';

export const resolvers = {
  DateTime: dateTimeScalar,
  
  Query: {
    health: () => 'ok',
    nodeCount: async () => {
      try {
        const result = await neo4jConnection.runQuery(
          'MATCH (n) RETURN count(n) as count'
        );
        const count = result.records[0].get('count');
        // Handle Neo4j integer type
        return neo4j.isInt(count) ? count.toNumber() : Number(count);
      } catch (error) {
        console.error('Error getting node count:', error);
        throw new Error('Failed to get node count');
      }
    }
  }
}; 