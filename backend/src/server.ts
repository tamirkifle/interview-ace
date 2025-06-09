import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { json } from 'body-parser';
import { neo4jConnection } from './db/neo4j';
import { initializeDatabase } from './db/initialize';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize Neo4j connection and database
async function initializeDatabaseConnection() {
  try {
    const isConnected = await neo4jConnection.verifyConnectivity();
    if (isConnected) {
      console.log('Connected to Neo4j');
      // Initialize database constraints and indexes
      await initializeDatabase();
    } else {
      console.error('Failed to connect to Neo4j');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error connecting to Neo4j:', error);
    process.exit(1);
  }
}

// Initialize Apollo Server
async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  // Apply Apollo middleware
  app.use(
    '/graphql',
    json(),
    expressMiddleware(server, {
      context: async () => ({
        // Add any context properties here
      }),
    })
  );

  console.log('Apollo Server started at /graphql');
}

// Start server
const httpServer = app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  await initializeDatabaseConnection();
  await startApolloServer();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing server and Neo4j connection...');
  await neo4jConnection.close();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 