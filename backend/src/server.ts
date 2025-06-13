import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { json } from 'body-parser';
import { neo4jConnection } from './db/neo4j';
import { initializeDatabase } from './db/initialize';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { minioService } from './services/minioService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function startServer() {
  try {
    // Test Neo4j connection
    await neo4jConnection.verifyConnectivity();
    console.log('Connected to Neo4j');

    // Initialize database constraints and indexes
    await initializeDatabase();
    console.log('Database initialized');

    // Test MinIO connection
    const minioConnected = await minioService.testConnection();
    if (!minioConnected) {
      console.warn('WARNING: MinIO connection failed. Video uploads will not work.');
    } else {
      // Ensure recordings bucket exists
      await minioService.ensureBucketExists();
      console.log('MinIO connected and bucket ready');
    }

    // Create Apollo Server
    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });

    await server.start();

    app.use(
      '/graphql',
      json(),
      expressMiddleware(server)
    );

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await neo4jConnection.close();
  process.exit(0);
});

startServer();