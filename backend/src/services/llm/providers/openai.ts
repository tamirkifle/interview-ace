import OpenAI from 'openai';
import { BaseLLMProvider } from './base';
import { GenerateQuestionsRequest, GeneratedQuestion, LLMError } from '../types';

export class OpenAIProvider extends BaseLLMProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model?: string) {
    super(apiKey, 'openai');
    this.client = new OpenAI({ apiKey });
    this.model = model || 'gpt-4-turbo-preview';
  }

  async generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]> {
    this.validateRequest(request);

    try {
      const { systemPrompt, userPrompt } = await this.buildPrompts(request);

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new LLMError('No response from OpenAI', 'PROVIDER_ERROR', 'openai');
      }

      return this.parseQuestionResponse(content);

    } catch (error: any) {
      if (error instanceof LLMError) throw error;
      
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