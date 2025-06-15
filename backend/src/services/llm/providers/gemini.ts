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
      
      const categories = request.categoryIds || [];
      const traits = request.traitIds || [];

      const prompt = `${this.buildSystemPrompt()}\n\n${this.buildUserPrompt(request, categories, traits)}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      // Extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new LLMError('Invalid response format from Gemini', 'PROVIDER_ERROR', 'gemini');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return parsed.map((q: any) => ({
        text: q.text || q.question,
        suggestedCategories: q.categories || q.suggestedCategories || [],
        suggestedTraits: q.traits || q.suggestedTraits || [],
        difficulty: q.difficulty || 'medium',
        reasoning: q.reasoning
      }));

    } catch (error: any) {
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