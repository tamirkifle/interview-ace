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
  private model: string;

  constructor(apiKey: string, model?: string) {
    super('ollama', 'ollama'); // Ollama doesn't use API keys
    // The apiKey parameter is actually the base URL for Ollama
    this.baseUrl = apiKey || 'http://localhost:11434';
    this.model = model || 'llama2';
  }

  async generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]> {
    this.validateRequest(request);

    try {
      const { systemPrompt, userPrompt } = await this.buildPrompts(request);

      const response = await axios.post<OllamaGenerateResponse>(
        `${this.baseUrl}/api/generate`, 
        {
          model: this.model,
          prompt: `${systemPrompt}\n\n${userPrompt}`,
          stream: false,
          format: 'json'
        }
      );

      const content = response.data.response;
      
      return this.parseQuestionResponse(content);

    } catch (error: any) {
      if (error instanceof LLMError) throw error;
      
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

  async generateCompletion(prompt: string): Promise<string> {
    try {
      const response = await axios.post<OllamaGenerateResponse>(
        `${this.baseUrl}/api/generate`, 
        {
          model: this.model,
          prompt,
          stream: false
        }
      );

      const content = response.data.response;
      if (!content) {
        throw new LLMError('No response from Ollama', 'PROVIDER_ERROR', 'ollama');
      }

      return content;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new LLMError('Cannot connect to Ollama. Is it running?', 'PROVIDER_ERROR', 'ollama');
      }
      throw new LLMError(
        error.message || 'Ollama completion failed',
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