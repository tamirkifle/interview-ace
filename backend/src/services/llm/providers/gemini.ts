import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseLLMProvider } from './base';
import { GenerateQuestionsRequest, GeneratedQuestion, LLMError } from '../types';

export class GeminiProvider extends BaseLLMProvider {
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    super(apiKey, 'gemini');
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]> {
    this.validateRequest(request);

    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-pro' });
      const { systemPrompt, userPrompt } = await this.buildPrompts(request);

      const prompt = `${systemPrompt}\n\n${userPrompt}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      return this.parseQuestionResponse(content);

    } catch (error: any) {
      if (error instanceof LLMError) throw error;
      
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new LLMError('Invalid Gemini API key', 'INVALID_API_KEY', 'gemini');
      }
      if (error.message?.includes('RATE_LIMIT_EXCEEDED')) {
        throw new LLMError('Gemini rate limit exceeded', 'RATE_LIMIT', 'gemini');
      }
      throw new LLMError(
        error.message || 'Gemini request failed',
        'PROVIDER_ERROR',
        'gemini'
      );
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-pro' });
      await model.generateContent('Test');
      return true;
    } catch {
      return false;
    }
  }
}