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
  
  type Question {
    id: ID!
    text: String!
    difficulty: String!
    commonality: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
    categories: [Category!]!
    traits: [Trait!]!
    recordings: [Recording!]!
    matchingStories(limit: Int = 5): [StoryMatch!]!
  }

  type Recording {
    id: ID!
    filename: String!
    duration: Int!
    minio_key: String!
    createdAt: DateTime!
    story: Story
    question: Question!
  }

  type StoryMatch {
    story: Story!
    relevanceScore: Float!
    matchedCategories: [Category!]!
    matchedTraits: [Trait!]!
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
    recordingsByQuestion(questionId: ID!): [Recording!]!  # Add this line
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

  input CreateRecordingInput {  # Add this input type
    questionId: ID!
    storyId: ID
    duration: Int!
    filename: String!
    minioKey: String!
  }

  type Mutation {
    createStory(input: CreateStoryInput!): Story!
    createRecording(input: CreateRecordingInput!): Recording!  # Add this mutation
    deleteRecording(id: ID!): Boolean!  # Add this mutation
  }
`;