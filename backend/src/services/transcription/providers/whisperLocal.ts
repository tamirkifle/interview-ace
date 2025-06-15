import { BaseTranscriptionProvider } from './base';
import { TranscriptionResult, TranscriptionError } from '../types';

export class WhisperLocalProvider extends BaseTranscriptionProvider {
  constructor() {
    // Local provider doesn't need an API key
    super('local', 'whisperLocal');
  }

  async transcribe(audioBuffer: Buffer, mimeType: string): Promise<TranscriptionResult> {
    this.validateAudioFormat(mimeType);

    // Local Whisper implementation
    // This would require setting up a local Whisper server
    throw new TranscriptionError(
      'Local Whisper provider not yet implemented',
      'PROVIDER_ERROR',
      this.providerName
    );
  }

  async validateApiKey(): Promise<boolean> {
    // Local provider doesn't need validation
    return true;
  }
}