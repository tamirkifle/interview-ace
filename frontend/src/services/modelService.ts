import { ModelInfo, ModelsCache, LLMProvider } from '../types/apiKeys';

class ModelService {
  private readonly CACHE_KEY = 'interview_prep_models_cache';

  // Default models as fallback
  private readonly DEFAULT_MODELS: Record<LLMProvider, ModelInfo[]> = {
    openai: [
      { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', displayName: 'GPT-4 Turbo (Latest)' },
      { id: 'gpt-4', name: 'GPT-4', displayName: 'GPT-4' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', displayName: 'GPT-3.5 Turbo' }
    ],
    anthropic: [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', displayName: 'Claude 3 Opus' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', displayName: 'Claude 3 Sonnet' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', displayName: 'Claude 3 Haiku' }
    ],
    gemini: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', displayName: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', displayName: 'Gemini 1.5 Flash' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', displayName: 'Gemini 1.5 Pro' }
    ],
    ollama: [
      { id: 'llama3.1:latest', name: 'Llama 3.1', displayName: 'Llama 3.1 (Latest)' },
      { id: 'mistral:latest', name: 'Mistral', displayName: 'Mistral (Latest)' },
      { id: 'phi3:latest', name: 'Phi-3', displayName: 'Phi-3 (Latest)' }
    ]
  };

  getCache(): ModelsCache {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  }

  saveCache(cache: ModelsCache): void {
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
  }

  async fetchOpenAIModels(apiKey: string): Promise<ModelInfo[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch models');

      const data = await response.json();
      const models = data.data
        .filter((model: any) => 
          model.id.includes('gpt') && 
          !model.id.includes('instruct') &&
          !model.id.includes('vision')
        )
        .map((model: any) => ({
          id: model.id,
          name: model.id,
          displayName: model.id.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
        }))
        .sort((a: ModelInfo, b: ModelInfo) => b.id.localeCompare(a.id));

      // Update cache
      const cache = this.getCache();
      cache.openai = {
        models,
        fetchedAt: new Date().toISOString()
      };
      this.saveCache(cache);

      return models;
    } catch (error) {
      console.error('Failed to fetch OpenAI models:', error);
      return this.DEFAULT_MODELS.openai;
    }
  }

  async fetchAnthropicModels(apiKey: string): Promise<ModelInfo[]> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch models');

      const data = await response.json();
      const models = data.data.map((model: any) => ({
        id: model.id,
        name: model.display_name || model.id,
        displayName: model.display_name
      }));

      // Update cache
      const cache = this.getCache();
      cache.anthropic = {
        models,
        fetchedAt: new Date().toISOString()
      };
      this.saveCache(cache);

      return models;
    } catch (error) {
      console.error('Failed to fetch Anthropic models:', error);
      return this.DEFAULT_MODELS.anthropic;
    }
  }

  async fetchGeminiModels(apiKey: string): Promise<ModelInfo[]> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

      if (!response.ok) throw new Error('Failed to fetch models');

      const data = await response.json();
      const models = data.models
        .filter((model: any) => 
          model.supportedGenerationMethods?.includes('generateContent')
        )
        .map((model: any) => ({
          id: model.name.replace('models/', ''),
          name: model.displayName || model.name,
          displayName: model.displayName,
          description: model.description
        }));

      // Update cache
      const cache = this.getCache();
      cache.gemini = {
        models,
        fetchedAt: new Date().toISOString()
      };
      this.saveCache(cache);

      return models;
    } catch (error) {
      console.error('Failed to fetch Gemini models:', error);
      return this.DEFAULT_MODELS.gemini;
    }
  }

  async fetchOllamaModels(baseUrl: string): Promise<ModelInfo[]> {
    try {
      const response = await fetch(`${baseUrl}/api/tags`);

      if (!response.ok) throw new Error('Failed to fetch models');

      const data = await response.json();
      const models = data.models?.map((model: any) => ({
        id: model.name,
        name: model.name,
        displayName: `${model.name} (${model.details?.parameter_size || 'Unknown size'})`
      })) || [];

      // Update cache
      const cache = this.getCache();
      cache.ollama = {
        models,
        fetchedAt: new Date().toISOString()
      };
      this.saveCache(cache);

      return models;
    } catch (error) {
      console.error('Failed to fetch Ollama models:', error);
      return this.DEFAULT_MODELS.ollama;
    }
  }

  getModelsForProvider(provider: LLMProvider): ModelInfo[] {
    const cache = this.getCache();
    return cache[provider]?.models || this.DEFAULT_MODELS[provider];
  }

  clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
  }
}

export const modelService = new ModelService();