import { LLMContext, LLMProvider, GenerateQuestionsRequest, QuestionGenerationResult, LLMError } from './types';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GeminiProvider } from './providers/gemini';
import { OllamaProvider } from './providers/ollama';
import { v4 as uuidv4 } from 'uuid';

export class LLMService {
  private getProvider(context: LLMContext): LLMProvider {
    const { provider, apiKey } = context;

    if (!provider) {
      throw new LLMError('No LLM provider specified', 'INVALID_REQUEST', 'unknown');
    }

    if (!apiKey) {
      throw new LLMError('No API key provided', 'INVALID_API_KEY', provider);
    }

    switch (provider) {
      case 'openai':
        return new OpenAIProvider(apiKey);
      case 'anthropic':
        return new AnthropicProvider(apiKey);
      case 'gemini':
        return new GeminiProvider(apiKey);
      case 'ollama':
        return new OllamaProvider(apiKey); // apiKey is baseUrl for Ollama
      default:
        throw new LLMError(`Unknown provider: ${provider}`, 'INVALID_REQUEST', provider);
    }
  }

  async generateQuestions(
    request: GenerateQuestionsRequest,
    context: LLMContext
  ): Promise<QuestionGenerationResult> {
    const provider = this.getProvider(context);
    
    try {
      const questions = await provider.generateQuestions(request);
      
      const sourceType = request.jobDescription 
        ? (request.categoryIds?.length ? 'mixed' : 'job_description')
        : 'categories';

      return {
        questions,
        generationId: uuidv4(),
        sourceType,
        provider: provider.getName()
      };
    } catch (error) {
      if (error instanceof LLMError) {
        throw error;
      }
      throw new LLMError(
        'Unexpected error during question generation',
        'PROVIDER_ERROR',
        provider.getName()
      );
    }
  }

  async validateApiKey(context: LLMContext): Promise<boolean> {
    try {
      const provider = this.getProvider(context);
      return await provider.validateApiKey();
    } catch {
      return false;
    }
  }
}

export const llmService = new LLMService();