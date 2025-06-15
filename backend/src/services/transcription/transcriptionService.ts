import { TranscriptionContext, TranscriptionProvider, TranscriptionResult, TranscriptionError, TranscriptionStatus } from './types';
import { OpenAITranscriptionProvider } from './providers/openai';
import { GoogleTranscriptionProvider } from './providers/google';
import { AWSTranscriptionProvider } from './providers/aws';
import { WhisperLocalProvider } from './providers/whisperLocal';
import { neo4jConnection } from '../../db/neo4j';

export class TranscriptionService {
  private getProvider(context: TranscriptionContext): TranscriptionProvider | null {
    const { provider, apiKey } = context;

    if (!provider) {
      return null;
    }

    // For local provider, no API key needed
    if (provider === 'local') {
      return new WhisperLocalProvider();
    }

    if (!apiKey) {
      throw new TranscriptionError('No API key provided', 'INVALID_API_KEY', provider);
    }

    switch (provider) {
      case 'openai':
        return new OpenAITranscriptionProvider(apiKey);
      case 'google':
        return new GoogleTranscriptionProvider(apiKey);
      case 'aws':
        return new AWSTranscriptionProvider(apiKey);
      default:
        throw new TranscriptionError(`Unknown provider: ${provider}`, 'INVALID_REQUEST', provider);
    }
  }

  async transcribe(
    audioBuffer: Buffer,
    mimeType: string,
    context: TranscriptionContext
  ): Promise<TranscriptionResult | null> {
    const provider = this.getProvider(context);
    
    if (!provider) {
      // No transcription requested
      return null;
    }

    try {
      return await provider.transcribe(audioBuffer, mimeType);
    } catch (error) {
      if (error instanceof TranscriptionError) {
        throw error;
      }
      throw new TranscriptionError(
        'Unexpected error during transcription',
        'PROVIDER_ERROR',
        provider.getName()
      );
    }
  }

  async updateRecordingTranscript(
    recordingId: string,
    transcript: string,
    status: TranscriptionStatus
  ): Promise<void> {
    const session = await neo4jConnection.getSession();
    try {
      await session.run(
        `
        MATCH (r:Recording {id: $recordingId})
        SET r.transcript = $transcript,
            r.transcriptStatus = $status,
            r.transcriptedAt = datetime()
        RETURN r
        `,
        { recordingId, transcript, status }
      );
    } finally {
      await session.close();
    }
  }

  async updateRecordingStatus(
    recordingId: string,
    status: TranscriptionStatus
  ): Promise<void> {
    const session = await neo4jConnection.getSession();
    try {
      await session.run(
        `
        MATCH (r:Recording {id: $recordingId})
        SET r.transcriptStatus = $status
        RETURN r
        `,
        { recordingId, status }
      );
    } finally {
      await session.close();
    }
  }

  async validateApiKey(context: TranscriptionContext): Promise<boolean> {
    try {
      const provider = this.getProvider(context);
      if (!provider) {
        return false;
      }
      return await provider.validateApiKey();
    } catch {
      return false;
    }
  }
}

export const transcriptionService = new TranscriptionService();