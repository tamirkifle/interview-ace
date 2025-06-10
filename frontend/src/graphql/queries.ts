import { gql } from '@apollo/client';

export const GET_STORIES = gql`
  query GetStories {
    stories {
      id
      title
      situation
      task
      action
      result
      createdAt
      updatedAt
      categories {
        id
        name
        description
        color
      }
      traits {
        id
        name
        description
      }
      recordings {
        id
        filename
        duration
        minio_key
        createdAt
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      description
      color
    }
  }
`;

export const GET_TRAITS = gql`
  query GetTraits {
    traits {
      id
      name
      description
    }
  }
`;

export const GET_QUESTIONS = gql`
  query GetQuestions {
    questions {
      id
      text
      difficulty
      commonality
      createdAt
      updatedAt
      categories {
        id
        name
      }
      traits {
        id
        name
      }
    }
  }
`; 