import gql from 'graphql-tag';

export const typeDefs = gql`
  scalar DateTime

  type Story {
    id: ID!
    title: String!
    situation: String!
    task: String!
    action: String!
    result: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    categories: [Category!]!
    traits: [Trait!]!
    recordings: [Recording!]!
    questions: [Question!]!
  }
  
  type Category {
    id: ID!
    name: String!
    color: String!
    icon: String
    description: String
    createdAt: DateTime!
    updatedAt: DateTime!
    stories: [Story!]!
    questions: [Question!]!
  }
  
  type Trait {
    id: ID!
    name: String!
    description: String
    createdAt: DateTime!
    updatedAt: DateTime!
    stories: [Story!]!
    questions: [Question!]!
  }
  
  type Job {
    id: ID!
    company: String!
    title: String!
    description: String!
    questions: [Question!]!
  }

  type Question {
    id: ID!
    text: String!
    difficulty: String!
    commonality: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
    source: String
    reasoning: String
    categories: [Category!]!
    traits: [Trait!]!
    recordings: [Recording!]!
    matchingStories(limit: Int = 5): [StoryMatch!]!
    job: Job
  }

  type Recording {
    id: ID!
    filename: String!
    duration: Int!
    minio_key: String!
    createdAt: DateTime!
    story: Story
    question: Question!
    transcript: String
    transcriptStatus: TranscriptionStatus
    transcriptedAt: DateTime
  }

  enum TranscriptionStatus {
    NONE
    PENDING
    PROCESSING
    COMPLETED
    FAILED
  }

  type StoryMatch {
    story: Story!
    relevanceScore: Float!
    matchedCategories: [Category!]!
    matchedTraits: [Trait!]!
  }

  # Question Generation Types
  type GeneratedQuestion {
    text: String!
    suggestedCategories: [Category!]!
    suggestedTraits: [Trait!]!
    difficulty: String!
    reasoning: String!
  }

  type QuestionGenerationResult {
    questions: [GeneratedQuestion!]!
    generationId: String!
    sourceType: String!
    provider: String!
  }

  type Query {
    # Health checks
    health: String!
    nodeCount: Int!
    
    # Main entities
    stories: [Story!]!
    story(id: ID!): Story
    categories: [Category!]!
    category(id: ID!): Category
    traits: [Trait!]!
    trait(id: ID!): Trait
    questions: [Question!]!
    question(id: ID!): Question
    recording(id: ID!): Recording
    recordings(
      where: RecordingWhereInput
      orderBy: RecordingOrderBy
    ): [Recording!]!
    recordingsByQuestion(questionId: ID!): [Recording!]!
    questionsForCompany(company: String!): [Question!]!

    # Question Generation
    generateQuestions(input: GenerateQuestionsInput!): QuestionGenerationResult!
    validateLLMKey: Boolean!
    recordingTranscriptionStatus(id: ID!): TranscriptionStatus
  }

  input CreateStoryInput {
    title: String!
    situation: String!
    task: String!
    action: String!
    result: String!
    categoryIds: [ID!]
    traitIds: [ID!]
  }

  input CreateRecordingInput {
    questionId: ID!
    storyId: ID
    duration: Int!
    filename: String!
    minioKey: String!
  }

  input GenerateQuestionsInput {
    categoryIds: [ID!]
    traitIds: [ID!]
    jobDescription: String
    company: String
    title: String
    count: Int = 5
    difficulty: String
  }

  input CreateCustomQuestionInput {
    text: String!
    categoryIds: [ID!]!
    traitIds: [ID!]!
    difficulty: String!
  }

  input UpdateQuestionInput {
    text: String!
    difficulty: String!
    categoryIds: [ID!]!
    traitIds: [ID!]!
  }
    
  input RecordingWhereInput {
    createdAt_gte: DateTime
    createdAt_lte: DateTime
    questionId: ID
    storyId: ID
  }

  enum RecordingOrderBy {
    createdAt_ASC
    createdAt_DESC
  }

  type Mutation {
    createStory(input: CreateStoryInput!): Story!
    createRecording(input: CreateRecordingInput!): Recording!
    deleteRecording(id: ID!): Boolean!
    createCustomQuestion(input: CreateCustomQuestionInput!): Question!
    updateQuestion(id: ID!, text: String!): Question!
    deleteQuestions(ids: [ID!]!): Int!
    updateQuestionFull(id: ID!, input: UpdateQuestionInput!): Question!
    retryTranscription(id: ID!): Recording!
  }
`;