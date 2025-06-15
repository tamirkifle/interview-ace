import OpenAI from 'openai';
import { BaseLLMProvider } from './base';
import { GenerateQuestionsRequest, GeneratedQuestion, LLMError } from '../types';

export class OpenAIProvider extends BaseLLMProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    super(apiKey, 'openai');
    this.client = new OpenAI({ apiKey });
  }

  async generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]> {
    this.validateRequest(request);

    try {
      // TODO: Fetch actual categories and traits from database
      const categories = request.categoryIds || [];
      const traits = request.traitIds || [];

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: this.buildSystemPrompt() },
          { role: 'user', content: this.buildUserPrompt(request, categories, traits) }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new LLMError('No response from OpenAI', 'PROVIDER_ERROR', 'openai');
      }

      const parsed = JSON.parse(content);
      const questions = Array.isArray(parsed) ? parsed : parsed.questions || [];

      return questions.map((q: any) => ({
        text: q.text || q.question,
        suggestedCategories: q.categories || q.suggestedCategories || [],
        suggestedTraits: q.traits || q.suggestedTraits || [],
        difficulty: q.difficulty || 'medium',
        reasoning: q.reasoning
      }));

    } catch (error: any) {
      if (error.status === 401) {
        throw new LLMError('Invalid OpenAI API key', 'INVALID_API_KEY', 'openai');
      }
      if (error.status === 429) {
        throw new LLMError('OpenAI rate limit exceeded', 'RATE_LIMIT', 'openai');
      }
      throw new LLMError(
        error.message || 'OpenAI request failed',
        'PROVIDER_ERROR',
        'openai'
      );
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}