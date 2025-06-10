import { gql } from 'graphql-tag';
import { typeDefs as nodeTypes } from './schema/types';

export const typeDefs = gql`
  ${nodeTypes}

  type Query {
    health: String!
    nodeCount: Int!
    stories: [Story!]!
    story(id: ID!): Story
    categories: [Category!]!
    traits: [Trait!]!
    questions: [Question!]!
  }

  type Mutation {
    createStory(input: CreateStoryInput!): Story!
  }
`; 