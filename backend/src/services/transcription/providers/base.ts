import { TranscriptionProvider, TranscriptionResult, TranscriptionError } from '../types';

export abstract class BaseTranscriptionProvider implements TranscriptionProvider {
  protected apiKey: string;
  protected providerName: string;

  constructor(apiKey: string, providerName: string) {
    if (!apiKey) {
      throw new TranscriptionError('API key is required', 'INVALID_API_KEY', providerName);
    }
    this.apiKey = apiKey;
    this.providerName = providerName;
  }

  abstract transcribe(audioBuffer: Buffer, mimeType: string): Promise<TranscriptionResult>;
  
  abstract validateApiKey(): Promise<boolean>;

  getName(): string {
    return this.providerName;
  }

  protected validateAudioFormat(mimeType: string): void {
    const supportedFormats = ['audio/webm', 'video/webm', 'audio/mp4', 'video/mp4', 'audio/mpeg'];
    if (!supportedFormats.includes(mimeType)) {
      throw new TranscriptionError(
        `Unsupported audio format: ${mimeType}`,
        'INVALID_REQUEST',
        this.providerName
      );
    }
  }
}