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
      questions {
        id
        text
        difficulty
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
        color
        description
      }
      traits {
        id
        name
        description
      }
    }
  }
`; 

export const CREATE_STORY = gql`
  mutation CreateStory($input: CreateStoryInput!) {
    createStory(input: $input) {
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
        color
      }
      traits {
        id
        name
      }
    }
  }
`;

export const GET_MATCHING_STORIES = gql`
  query GetMatchingStories($questionId: ID!, $limit: Int = 3) {
    question(id: $questionId) {
      id
      matchingStories(limit: $limit) {
        story {
          id
          title
          situation
          createdAt
          categories {
            id
            name
            color
            description
          }
           traits {
           id
           name
           description
          }
        }
        relevanceScore
        matchedCategories {
          id
          name
          color
        }
        matchedTraits {
          id
          name
        }
      }
    }
  }
`;