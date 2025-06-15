import { LLMProvider, GenerateQuestionsRequest, GeneratedQuestion, LLMError } from '../types';

export abstract class BaseLLMProvider implements LLMProvider {
  protected apiKey: string;
  protected providerName: string;

  constructor(apiKey: string, providerName: string) {
    if (!apiKey) {
      throw new LLMError('API key is required', 'INVALID_API_KEY', providerName);
    }
    this.apiKey = apiKey;
    this.providerName = providerName;
  }

  abstract generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]>;
  
  abstract validateApiKey(): Promise<boolean>;

  getName(): string {
    return this.providerName;
  }

  protected validateRequest(request: GenerateQuestionsRequest): void {
    const count = request.count || 5;
    if (count < 1 || count > 20) {
      throw new LLMError(
        'Question count must be between 1 and 20',
        'INVALID_REQUEST',
        this.providerName
      );
    }

    if (!request.categoryIds?.length && !request.jobDescription) {
      throw new LLMError(
        'Either categoryIds or jobDescription must be provided',
        'INVALID_REQUEST',
        this.providerName
      );
    }
  }

  protected buildSystemPrompt(): string {
    return `You are an expert behavioral interview coach helping candidates prepare for interviews. 
Your task is to generate behavioral interview questions that follow the STAR method (Situation, Task, Action, Result).

Guidelines:
- Questions should be open-ended and begin with phrases like "Tell me about a time when...", "Describe a situation where...", "Give me an example of..."
- Focus on past experiences, not hypothetical situations
- Questions should probe for specific competencies and behaviors
- Vary the difficulty appropriately
- Each question should be clear and concise`;
  }

  protected buildUserPrompt(request: GenerateQuestionsRequest, categories: string[], traits: string[]): string {
    let prompt = `Generate ${request.count || 5} behavioral interview questions`;

    if (request.difficulty) {
      prompt += ` at ${request.difficulty} difficulty level`;
    }

    if (categories.length > 0) {
      prompt += `\n\nFocus on these categories: ${categories.join(', ')}`;
    }

    if (traits.length > 0) {
      prompt += `\n\nAssess these traits: ${traits.join(', ')}`;
    }

    if (request.jobDescription) {
      prompt += `\n\nJob Description:\n${request.jobDescription}`;
    }

    prompt += `\n\nFor each question, provide:
1. The question text
2. Which categories it relates to (from the list provided)
3. Which traits it assesses (from the list provided)
4. Difficulty level (easy, medium, or hard)
5. Brief reasoning for why this is a good question

Return the response as a JSON array.`;

    return prompt;
  }
}