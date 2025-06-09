import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { neo4jConnection } from './db/neo4j';

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

// Initialize Neo4j connection
async function initializeDatabase() {
  try {
    const isConnected = await neo4jConnection.verifyConnectivity();
    if (isConnected) {
      console.log('Connected to Neo4j');
    } else {
      console.error('Failed to connect to Neo4j');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error connecting to Neo4j:', error);
    process.exit(1);
  }
}

// Start server
const server = app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  await initializeDatabase();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing server and Neo4j connection...');
  await neo4jConnection.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 