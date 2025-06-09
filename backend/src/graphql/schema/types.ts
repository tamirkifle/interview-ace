import { gql } from 'graphql-tag';

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
  }
  
  type Category {
    id: ID!
    name: String!
    color: String!
    icon: String!
    description: String
  }
  
  type Trait {
    id: ID!
    name: String!
    description: String
  }
  
  type Question {
    id: ID!
    text: String!
    difficulty: String!
    commonality: Int!
  }
`; 