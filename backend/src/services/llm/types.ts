import { Category, Trait } from '../storyService';

export interface LLMContext {
    provider?: string;
    apiKey?: string;
    model?: string;
}
  
export interface GenerateQuestionsRequest {
    categoryIds?: string[];
    traitIds?: string[];
    jobDescription?: string;
    company?: string;
    title?: string;
    count?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
}
  
export interface GeneratedQuestion {
    id?: string;
    text: string;
    suggestedCategories: string[]; // Raw strings from LLM
    suggestedTraits: string[]; // Raw strings from LLM
    difficulty: 'easy' | 'medium' | 'hard';
    reasoning?: string;
}

export interface ResolvedGeneratedQuestion {
  id?: string;
  text: string;
  suggestedCategories: Category[]; // Resolved objects for GraphQL
  suggestedTraits: Trait[]; // Resolved objects for GraphQL
  difficulty: 'easy' | 'medium' | 'hard';
  reasoning?: string;
  metadata?: {
    entityType?: string;
    entityId?: string;
    source?: string;
  };
}
  
export interface QuestionGenerationResult {
    questions: ResolvedGeneratedQuestion[];
    generationId: string;
    sourceType: 'categories' | 'job' | 'mixed' | 'experience' | 'project' | 'generated';
    provider: string;
}
  
export interface LLMProvider {
    generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]>;
    generateCompletion(prompt: string): Promise<string>;
    validateApiKey(): Promise<boolean>;
    getName(): string;
}
  
export class LLMError extends Error {
    constructor(
      message: string,
      public code: 'INVALID_API_KEY' | 'RATE_LIMIT' | 'INVALID_REQUEST' | 'PROVIDER_ERROR',
      public provider: string
    ) {
      super(message);
      this.name = 'LLMError';
    }
}