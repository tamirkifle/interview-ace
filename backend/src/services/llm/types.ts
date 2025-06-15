export interface LLMContext {
    provider?: string;
    apiKey?: string;
    model?: string;
}
  
  export interface GenerateQuestionsRequest {
    categoryIds?: string[];
    traitIds?: string[];
    jobDescription?: string;
    count?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
  }
  
  export interface GeneratedQuestion {
    text: string;
    suggestedCategories: string[];
    suggestedTraits: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    reasoning?: string;
  }
  
  export interface QuestionGenerationResult {
    questions: GeneratedQuestion[];
    generationId: string;
    sourceType: 'categories' | 'job_description' | 'mixed';
    provider: string;
  }
  
  export interface LLMProvider {
    generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]>;
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