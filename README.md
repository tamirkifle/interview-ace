# StoryBank - Interview Prep Application

StoryBank is a modern interview preparation application that helps users prepare for technical interviews through a structured learning platform. The application uses a graph database to model relationships between interview questions, answers, and categories.

## Tech Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + Apollo GraphQL
- Database: Neo4j (Docker)
- Storage: MinIO (Docker) for video files

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Starting Services

1. Start all services:
   ```bash
   docker-compose up -d
   ```

2. Wait for the containers to be healthy (this may take a few moments on first run)

### Accessing Neo4j Browser

1. Open your web browser and navigate to: http://localhost:7474
2. Login credentials:
   - Username: neo4j
   - Password: password123

### Neo4j Connection Details

- Browser Interface: http://localhost:7474
- Bolt Connection: bolt://localhost:7687
- Default Credentials: neo4j/password123

### Accessing MinIO Console

1. Open your web browser and navigate to: http://localhost:9001
2. Login credentials:
   - Username: admin
   - Password: password123

### MinIO Connection Details

- Console Interface: http://localhost:9001
- API Endpoint: http://localhost:9000
- Default Credentials: admin/password123

## Development

More development instructions will be added as the project progresses. 