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
import { upload } from './middleware/upload';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Video upload endpoint
app.post('/api/upload-video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No video file provided' 
      });
    }

    console.log('Received video upload:', {
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Upload to MinIO
    const minioKey = await minioService.uploadVideo(
      req.file.buffer,
      req.file.originalname
    );

    res.json({
      success: true,
      minioKey,
      originalName: req.file.originalname,
      size: req.file.size
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    
    if (error.message.includes('File size exceeds')) {
      return res.status(413).json({ 
        error: 'File too large. Maximum size is 100MB.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to upload video',
      message: error.message 
    });
  }
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
      expressMiddleware(server, {
        context: async ({ req }) => {
          // Extract LLM headers
          const llmContext = {
            provider: req.headers['x-llm-provider'] as string,
            apiKey: req.headers['x-llm-key'] as string,
            model: req.headers['x-llm-model'] as string,
          };
    
          // Extract transcription headers
          const transcriptionContext = {
            provider: req.headers['x-transcription-provider'] as string,
            apiKey: req.headers['x-transcription-key'] as string,
            whisperEndpoint: req.headers['x-transcription-whisper-endpoint'] as string,
          };
    
          return {
            llmContext,
            transcriptionContext,
          };
        },
      })
    );

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
      console.log(`Video upload endpoint: http://localhost:${PORT}/api/upload-video`);
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