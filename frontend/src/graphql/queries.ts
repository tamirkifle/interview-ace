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
      source
      reasoning
      sourceInfo {
        type
        name
        displayName
      }
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
      job {
        id
        company
        title
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
// Question Generation Queries
export const GENERATE_QUESTIONS = gql`
  query GenerateQuestions($input: GenerateQuestionsInput!) {
    generateQuestions(input: $input) {
      questions {
        id
        text
        difficulty
        reasoning
        suggestedCategories {
          id
          name
          color
          description
        }
        suggestedTraits {
          id
          name
          description
        }
      }
      generationId
      sourceType
      provider
    }
  }
`;
export const VALIDATE_LLM_KEY = gql`
  query ValidateLLMKey {
    validateLLMKey
  }
`;
export const GET_RECORDINGS_GROUPED_BY_QUESTION = gql`
  query GetRecordingsGroupedByQuestion {
    questions {
      id
      text
      recordings {
        id
        createdAt
        duration
        minio_key
        filename
        transcript
        transcriptStatus
        transcriptedAt
        story {
          id
          title
        }
      }
    }
  }
`;
export const GET_RECORDINGS_BY_DATE = gql`
  query GetRecordingsByDate($startDate: DateTime, $endDate: DateTime) {
    recordings(
      where: { 
        createdAt_gte: $startDate, 
        createdAt_lte: $endDate 
      }
      orderBy: createdAt_DESC
    ) {
      id
      createdAt
      duration
      minio_key
      filename
      transcript
      transcriptStatus
      transcriptedAt
      question {
        id
        text
      }
      story {
        id
        title
      }
    }
  }
`;
export const GET_ALL_RECORDINGS = gql`
  query GetAllRecordings {
    recordings {
      id
      createdAt
      duration
      minio_key
      filename
      transcript
      transcriptStatus
      transcriptedAt
      question {
        id
        text
      }
      story {
        id
        title
      }
    }
  }
`;
export const SEARCH_RECORDINGS = gql`
  query SearchRecordings($searchTerm: String) {
    recordings(
      where: { 
        transcript_contains: $searchTerm 
      }
      orderBy: createdAt_DESC
    ) {
      id
      createdAt
      duration
      minio_key
      filename
      transcript
      transcriptStatus
      transcriptedAt
      question {
        id
        text
      }
      story {
        id
        title
      }
    }
  }
`;