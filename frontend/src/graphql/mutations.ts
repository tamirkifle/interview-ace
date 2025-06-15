import { gql } from '@apollo/client';

export const CREATE_RECORDING = gql`
  mutation CreateRecording($input: CreateRecordingInput!) {
    createRecording(input: $input) {
      id
      filename
      duration
      minio_key
      createdAt
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

export const DELETE_RECORDING = gql`
  mutation DeleteRecording($id: ID!) {
    deleteRecording(id: $id)
  }
`;

export const CREATE_CUSTOM_QUESTION = gql`
  mutation CreateCustomQuestion($input: CreateCustomQuestionInput!) {
    createCustomQuestion(input: $input) {
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
      }
      traits {
        id
        name
      }
    }
  }
`;