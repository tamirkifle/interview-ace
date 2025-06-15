export interface APIKeys {
  openai?: string;
  anthropic?: string;
  gemini?: string;
  ollama?: {
    apiKey?: string;
    baseUrl?: string;
  };
  llm?: {
    enabled?: boolean;  // Add enabled flag
    provider?: LLMProvider;
  };
  transcription?: {
    enabled?: boolean;  // Add enabled flag
    provider?: 'openai' | 'google' | 'aws' | 'local';
    apiKey?: string;
    region?: string;
  };
}

export type LLMProvider = 'openai' | 'anthropic' | 'gemini' | 'ollama';
export type TranscriptionProvider = 'openai' | 'google' | 'aws' | 'local';

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