import { APIKeys, APIKeyStatus, LLMProvider, TranscriptionProvider, ModelInfo, ModelsCache } from './apiKeys';

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface Trait {
  id: string;
  name: string;
  description: string;
}

export interface Job {
  id: string;
  company: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface Recording {
  id: string;
  filename: string;
  duration: number;
  minio_key: string;
  createdAt: string | Date;
  question?: Question;
  story?: Story;
  transcript?: string;
  transcriptStatus?: TranscriptionStatus;
  transcriptedAt?: string | Date;
}

export enum TranscriptionStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface Story {
  id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  createdAt: string;
  updatedAt: string;
  categories: Category[];
  traits: Trait[];
  recordings: Recording[];
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  difficulty: string;
  commonality: number;
  createdAt: string;
  updatedAt: string;
  categories: Category[];
  traits: Trait[];
  recordings?: Recording[];
  source?: string;
  reasoning?: string;
  job?: Job;
}

export interface StoryMatch {
  story: {
    id: string;
    title: string;
    situation: string;
    createdAt: string;
  };
  relevanceScore: number;
  matchedCategories: Category[];
  matchedTraits: Trait[];
}

// Question Generation Types
export interface GeneratedQuestion {
  text: string;
  suggestedCategories: Category[];
  suggestedTraits: Trait[];
  difficulty: string;
  reasoning: string;
  id?: string;
}

export interface QuestionGenerationResult {
  questions: GeneratedQuestion[];
  generationId: string;
  sourceType: string;
  provider: string;
}

export interface GenerateQuestionsInput {
  categoryIds?: string[];
  traitIds?: string[];
  jobDescription?: string;
  company?: string;
  title?: string;
  count?: number;
  difficulty?: string;
}

export * from './apiKeys';