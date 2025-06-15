import OpenAI from 'openai';
import { BaseTranscriptionProvider } from './base';
import { TranscriptionResult, TranscriptionError } from '../types';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

export class OpenAITranscriptionProvider extends BaseTranscriptionProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    super(apiKey, 'openai');
    this.client = new OpenAI({ apiKey });
  }

  async transcribe(audioBuffer: Buffer, mimeType: string): Promise<TranscriptionResult> {
    this.validateAudioFormat(mimeType);

    // OpenAI Whisper requires a file, so we need to write the buffer to a temp file
    const tempDir = os.tmpdir();
    const tempFileName = `whisper-${uuidv4()}.webm`;
    const tempFilePath = path.join(tempDir, tempFileName);

    try {
      // Write buffer to temp file
      await fs.promises.writeFile(tempFilePath, audioBuffer);

      // Create a ReadStream for OpenAI
      const fileStream = fs.createReadStream(tempFilePath);

      const response = await this.client.audio.transcriptions.create({
        file: fileStream,
        model: 'whisper-1',
        response_format: 'json',
        language: 'en'
      });

      return {
        transcript: response.text,
        confidence: 0.95 // Whisper doesn't provide confidence scores
      };
    } catch (error: any) {
      if (error.status === 401) {
        throw new TranscriptionError('Invalid API key', 'INVALID_API_KEY', this.providerName);
      } else if (error.status === 429) {
        throw new TranscriptionError('Rate limit exceeded', 'RATE_LIMIT', this.providerName);
      }
      throw new TranscriptionError(
        error.message || 'Transcription failed',
        'PROVIDER_ERROR',
        this.providerName
      );
    } finally {
      // Clean up temp file
      try {
        await fs.promises.unlink(tempFilePath);
      } catch (err) {
        console.error('Failed to clean up temp file:', err);
      }
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // Simple validation by checking models endpoint
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}