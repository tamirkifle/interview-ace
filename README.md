# InterviewAce - AI-Powered Interview Preparation Platform

InterviewAce is a comprehensive interview preparation application that helps users master behavioral interviews through structured practice, AI-powered question generation, and intelligent story matching. The platform uses a graph database to model relationships between interview questions, STAR stories, and professional traits.

## 🚀 Features

### Core Functionality
- **STAR Story Management**: Create, organize, and categorize your behavioral interview stories using the STAR method (Situation, Task, Action, Result)
- **Question Library**: Maintain a comprehensive library of interview questions with difficulty levels and categorization
- **Practice Sessions**: Interactive practice mode with randomized questions to simulate real interview conditions
- **Recording & Transcription**: Record your practice sessions with automatic transcription using multiple AI providers
- **Story Matching**: Intelligent matching of your stories to relevant interview questions based on categories and traits

### AI-Powered Features
- **Question Generation**: Generate personalized interview questions using multiple LLM providers (OpenAI, Anthropic, Google Gemini, Ollama)
- **Job Description Analysis**: Upload job descriptions to generate targeted questions
- **Transcription Services**: Multiple transcription providers including OpenAI Whisper, Google Speech-to-Text, AWS Transcribe, and local Whisper
- **Smart Recommendations**: AI-powered story suggestions based on question context

### User Experience
- **Modern UI**: Clean, responsive interface built with React, TypeScript, and Tailwind CSS
- **Real-time Feedback**: Instant transcription status and practice session tracking
- **Flexible Configuration**: Support for multiple AI providers with easy API key management
- **Analytics Dashboard**: Track your progress and performance metrics
- **Search & Filter**: Advanced filtering and search capabilities across all content

## 🛠 Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Apollo Client** for GraphQL data management
- **React Router** for navigation
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **Apollo GraphQL Server**
- **TypeScript** for type safety
- **Neo4j** graph database for relationship modeling
- **MinIO** for file storage

### AI & ML Services
- **OpenAI** (GPT-4, GPT-3.5 Turbo)
- **Anthropic** (Claude 3 Opus, Sonnet, Haiku)
- **Google Gemini**
- **Ollama** (local LLM support)
- **Multiple Transcription Providers**: OpenAI Whisper, Google Speech-to-Text, AWS Transcribe, Local Whisper

### Infrastructure
- **Docker** and **Docker Compose** for containerization
- **Neo4j** for graph database
- **MinIO** for object storage
- **Health checks** and **automatic restarts**

## 🏗 Architecture

The application follows a modern microservices architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Neo4j DB      │
│   (React/TS)    │◄──►│  (Node/GraphQL) │◄──►│   (Graph DB)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │     MinIO       │
                       │  (File Storage) │
                       └─────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- **Docker** and **Docker Compose**
- **Node.js** 18+ (for local development)
- **Git**

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd InterviewAce
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start all services**:
   ```bash
   docker-compose up -d
   ```

4. **Access the application**:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:4000
   - **GraphQL Playground**: http://localhost:4000/graphql

### Development Setup

1. **Install dependencies**:
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

2. **Start development servers**:
   ```bash
   # Backend (in backend directory)
   npm run dev
   
   # Frontend (in frontend directory)
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Neo4j Configuration
NEO4J_PASSWORD=your_secure_password

# MinIO Configuration
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=your_secure_password
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=your_secure_password

# Optional: AI Provider API Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key
```

### AI Provider Setup

1. **Navigate to Settings** in the application
2. **Configure API Keys** for your preferred providers
3. **Select Default Provider** for question generation
4. **Test Configuration** to ensure everything works

## 📊 Database Access

### Neo4j Browser
- **URL**: http://localhost:7474
- **Username**: neo4j
- **Password**: (from your .env file)

### MinIO Console
- **URL**: http://localhost:9001
- **Username**: admin
- **Password**: (from your .env file)

## 🎯 Usage Guide

### Creating Your First Story
1. Navigate to **Stories** → **Create Story**
2. Fill in the STAR components (Situation, Task, Action, Result)
3. Select relevant categories and traits
4. Save your story

### Practice Session
1. Go to **Practice** section
2. Choose from:
   - **Question Library**: Use existing questions
   - **Generate Questions**: Create new AI-generated questions
   - **Custom Questions**: Add your own questions
3. Start a practice session
4. Record your answers
5. Review transcriptions and get story suggestions

### Managing Questions
1. Visit the **Library** section
2. Browse questions by category or difficulty
3. Edit or delete questions as needed
4. View associated recordings and stories

## 🔍 API Documentation

The application uses GraphQL for all data operations. Key operations include:

### Stories
- `createStory`: Create new STAR stories
- `stories`: Fetch all stories with filtering
- `story(id)`: Get specific story details

### Questions
- `questions`: Fetch question library
- `generateQuestions`: AI-powered question generation
- `createCustomQuestion`: Add custom questions

### Recordings
- `createRecording`: Save practice recordings
- `recordings`: Fetch recordings with filtering
- `retryTranscription`: Retry failed transcriptions

### Categories & Traits
- `categories`: Get all question/story categories
- `traits`: Get all professional traits

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

## 🚀 Deployment

### Production Build
```bash
# Build all services
docker-compose -f docker-compose.yml build

# Start production services
docker-compose -f docker-compose.yml up -d
```

### Environment-Specific Configurations
- Use `docker-compose.dev.yml` for development
- Use `docker-compose.yml` for production
- Configure environment variables for each environment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review existing issues
- Create a new issue with detailed information

## 🔮 Roadmap

- [ ] Advanced analytics and performance tracking
- [ ] Collaborative features and sharing
- [ ] Mobile application
- [ ] Integration with job boards
- [ ] Advanced AI coaching features
- [ ] Video analysis and feedback
- [ ] Interview scheduling integration

---

**InterviewAce** - Master your interviews with AI-powered preparation! 🎯 