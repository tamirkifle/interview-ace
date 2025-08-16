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
    suggestedCategories: string[]; // <-- This will be an array of strings from the LLM
    suggestedTraits: string[]; // <-- This will be an array of strings from the LLM
    difficulty: 'easy' | 'medium' | 'hard';
    reasoning?: string;
}

export interface ResolvedGeneratedQuestion {
  id?: string;
  text: string;
  suggestedCategories: Category[]; // <-- The resolved category objects
  suggestedTraits: Trait[]; // <-- The resolved trait objects
  difficulty: 'easy' | 'medium' | 'hard';
  reasoning?: string;
}
  
export interface QuestionGenerationResult {
    questions: ResolvedGeneratedQuestion[]; // <-- Update this to use the resolved type
    generationId: string;
    sourceType: 'categories' | 'job_description' | 'mixed' | 'resume';
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