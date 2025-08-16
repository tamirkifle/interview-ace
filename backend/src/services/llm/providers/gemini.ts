import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseLLMProvider } from './base';
import { GenerateQuestionsRequest, GeneratedQuestion, LLMError } from '../types';

export class GeminiProvider extends BaseLLMProvider {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model?: string) {
    super(apiKey, 'gemini');
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = model || 'gemini-1.5-flash';
  }

  async generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]> {
    this.validateRequest(request);

    try {
      const genModel = this.client.getGenerativeModel({ model: this.model });
      const { systemPrompt, userPrompt } = await this.buildPrompts(request);

      const prompt = `${systemPrompt}\n\n${userPrompt}`;
      const result = await genModel.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      return this.parseQuestionResponse(content);

    } catch (error: any) {
      console.log({error})

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

  async generateCompletion(prompt: string): Promise<string> {
    try {
      const genModel = this.client.getGenerativeModel({ model: this.model });
      const result = await genModel.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      if (!content) {
        throw new LLMError('No response from Gemini', 'PROVIDER_ERROR', 'gemini');
      }

      return content;
    } catch (error: any) {
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new LLMError('Invalid Gemini API key', 'INVALID_API_KEY', 'gemini');
      }
      throw new LLMError(
        error.message || 'Gemini completion failed',
        'PROVIDER_ERROR',
        'gemini'
      );
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const genModel = this.client.getGenerativeModel({ model: this.model });
      await genModel.generateContent('Test');
      return true;
    } catch {
      return false;
    }
  }
}