export interface TranscriptionContext {
    provider?: string;
    apiKey?: string;
    whisperEndpoint?: string;
  }
  
  export interface TranscriptionJob {
    recordingId: string;
    minioKey: string;
    status: TranscriptionStatus;
  }
  
  export type TranscriptionStatus = 'NONE' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  
  export interface TranscriptionResult {
    transcript: string;
    confidence?: number;
    duration?: number;
  }
  
  export interface TranscriptionProvider {
    transcribe(audioBuffer: Buffer, mimeType: string): Promise<TranscriptionResult>;
    validateApiKey(): Promise<boolean>;
    getName(): string;
  }
  
  export class TranscriptionError extends Error {
    constructor(
      message: string,
      public code: 'INVALID_API_KEY' | 'RATE_LIMIT' | 'INVALID_REQUEST' | 'PROVIDER_ERROR',
      public provider: string
    ) {
      super(message);
      this.name = 'TranscriptionError';
    }
  }