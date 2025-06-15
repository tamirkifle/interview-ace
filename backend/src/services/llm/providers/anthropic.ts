import Anthropic from '@anthropic-ai/sdk';
import { BaseLLMProvider } from './base';
import { GenerateQuestionsRequest, GeneratedQuestion, LLMError } from '../types';

export class AnthropicProvider extends BaseLLMProvider {
  private client: Anthropic;

  constructor(apiKey: string) {
    super(apiKey, 'anthropic');
    this.client = new Anthropic({ apiKey });
  }

  async generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]> {
    this.validateRequest(request);

    try {
      const categories = request.categoryIds || [];
      const traits = request.traitIds || [];

      const message = await this.client.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 2000,
        temperature: 0.7,
        system: this.buildSystemPrompt(),
        messages: [{
          role: 'user',
          content: this.buildUserPrompt(request, categories, traits) + '\n\nPlease format your response as valid JSON.'
        }]
      });

      const content = message.content[0].type === 'text' ? message.content[0].text : '';
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new LLMError('Invalid response format from Claude', 'PROVIDER_ERROR', 'anthropic');
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
      if (error.status === 401) {
        throw new LLMError('Invalid Anthropic API key', 'INVALID_API_KEY', 'anthropic');
      }
      if (error.status === 429) {
        throw new LLMError('Anthropic rate limit exceeded', 'RATE_LIMIT', 'anthropic');
      }
      throw new LLMError(
        error.message || 'Anthropic request failed',
        'PROVIDER_ERROR',
        'anthropic'
      );
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // Try a minimal request to validate the key
      await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }]
      });
      return true;
    } catch {
      return false;
    }
  }
}