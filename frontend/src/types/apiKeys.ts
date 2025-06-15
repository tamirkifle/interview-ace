export type LLMProvider = 'openai' | 'anthropic' | 'gemini' | 'ollama';
export type TranscriptionProvider = 'openai' | 'google' | 'aws' | 'local';

export interface APIKeys {
  openai?: string;
  anthropic?: string;
  gemini?: string;
  ollama?: {
    apiKey?: string;
    baseUrl?: string;
  };
  llm?: {
    enabled?: boolean;
    provider?: LLMProvider;
    model?: string;
  };
  transcription?: {
    enabled?: boolean;
    provider?: TranscriptionProvider;
    apiKey?: string;  // This was missing!
    region?: string;
    whisperEndpoint?: string;
  };
}

export interface ModelInfo {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
}

export interface ModelsCache {
  openai?: {
    models: ModelInfo[];
    fetchedAt: string;
  };
  anthropic?: {
    models: ModelInfo[];
    fetchedAt: string;
  };
  gemini?: {
    models: ModelInfo[];
    fetchedAt: string;
  };
  ollama?: {
    models: ModelInfo[];
    fetchedAt: string;
  };
}

export interface APIKeyStatus {
  llm: {
    available: boolean;
    providers: LLMProvider[];
    selectedProvider?: LLMProvider;
  };
  transcription: {
    available: boolean;
    provider?: TranscriptionProvider;
  };
}