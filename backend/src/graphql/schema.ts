import { gql } from 'graphql-tag';
import { typeDefs as nodeTypes } from './schema/types';

export const typeDefs = gql`
  ${nodeTypes}

  type Query {
    health: String!
    nodeCount: Int!
  }
`; 