import gql from 'graphql-tag';

export const typeDefs = gql`
  scalar DateTime

  type Story {
    id: ID!
    title: String!
    content: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    categories: [Category!]!
    traits: [Trait!]!
    recordings: [Recording!]!
  }
  
  type Category {
    id: ID!
    name: String!
    description: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  
  type Trait {
    id: ID!
    name: String!
    description: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  
  type Question {
    id: ID!
    text: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    categories: [Category!]!
    traits: [Trait!]!
    recordings: [Recording!]!
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
`; 