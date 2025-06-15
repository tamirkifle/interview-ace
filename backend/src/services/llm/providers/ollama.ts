import axios from 'axios';
import { BaseLLMProvider } from './base';
import { GenerateQuestionsRequest, GeneratedQuestion, LLMError } from '../types';

interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export class OllamaProvider extends BaseLLMProvider {
  private baseUrl: string;

  constructor(apiKey: string) {
    super('ollama', 'ollama'); // Ollama doesn't use API keys
    // The apiKey parameter is actually the base URL for Ollama
    this.baseUrl = apiKey || 'http://localhost:11434';
  }

  async generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]> {
    this.validateRequest(request);

    try {
      const categories = request.categoryIds || [];
      const traits = request.traitIds || [];

      const response = await axios.post<OllamaGenerateResponse>(
        `${this.baseUrl}/api/generate`, 
        {
          model: 'llama2',
          prompt: `${this.buildSystemPrompt()}\n\n${this.buildUserPrompt(request, categories, traits)}`,
          stream: false,
          format: 'json'
        }
      );

      const content = response.data.response;
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
      if (error.code === 'ECONNREFUSED') {
        throw new LLMError('Cannot connect to Ollama. Is it running?', 'PROVIDER_ERROR', 'ollama');
      }
      throw new LLMError(
        error.message || 'Ollama request failed',
        'PROVIDER_ERROR',
        'ollama'
      );
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/api/tags`);
      return true;
    } catch {
      return false;
    }
  }
}