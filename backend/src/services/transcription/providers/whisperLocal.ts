import { BaseTranscriptionProvider } from './base';
import { TranscriptionResult, TranscriptionError } from '../types';
import axios from 'axios';
import FormData from 'form-data';

interface WhisperResponse {
  text?: string;
  transcript?: string;
  error?: string;
}

export class WhisperLocalProvider extends BaseTranscriptionProvider {
  private whisperUrl: string;

  constructor(whisperEndpoint?: string) {
    // Local provider doesn't need an API key
    super('local', 'whisperLocal');

    // Use provided endpoint or fallback to env or default
    this.whisperUrl = whisperEndpoint || 'http://localhost:9002';
    console.log(`[WhisperLocal] Using endpoint: ${this.whisperUrl}`);

  }

  async transcribe(audioBuffer: Buffer, mimeType: string): Promise<TranscriptionResult> {
    this.validateAudioFormat(mimeType);

    try {
      // Create form data for multipart upload
      const formData = new FormData();
      
      // Determine file extension from mime type
      const extension = this.getExtensionFromMimeType(mimeType);
      const filename = `audio.${extension}`;
      
      console.log(`[WhisperLocal] Preparing to transcribe:`, {
        filename,
        mimeType,
        bufferSize: audioBuffer.length,
        whisperUrl: this.whisperUrl
      });
      
      // Append the audio buffer as a file
      formData.append('audio_file', audioBuffer, {
        filename,
        contentType: mimeType
      });

      // Get the form data headers and length
      const formHeaders = formData.getHeaders();
      const formLength = formData.getLengthSync();
      
      console.log(`[WhisperLocal] Form data prepared:`, {
        headers: formHeaders,
        length: formLength
      });

      // Make request to Whisper service
      const response = await axios.post<WhisperResponse>(`${this.whisperUrl}/asr`, formData, {
        headers: {
          ...formHeaders,
          'Content-Length': formLength.toString()
        },
        params: {
          encode: 'true',  // Make sure this is a string
          task: 'transcribe',
          language: 'en',
          output: 'json'
        },
        timeout: 300000, // 5 minutes timeout for longer audio
      });

      // Extract transcript from response
      const transcript = response.data.text || response.data.transcript || '';
      
      if (!transcript) {
        throw new TranscriptionError(
          'No transcript returned from Whisper service',
          'PROVIDER_ERROR',
          this.providerName
        );
      }

      return {
        transcript: transcript.trim(),
        confidence: 0.95 // Whisper doesn't provide confidence scores
      };
    } catch (error: any) {
      console.error('[WhisperLocal] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new TranscriptionError(
          `Request failed with status code ${error.response.status}: ${JSON.stringify(error.response.data)}`,
          'PROVIDER_ERROR',
          this.providerName
        );
      } else if (error.request) {
        // The request was made but no response was received
        if (error.code === 'ECONNREFUSED') {
          throw new TranscriptionError(
            'Local Whisper service is not running',
            'PROVIDER_ERROR',
            this.providerName
          );
        }
        throw new TranscriptionError(
          'No response from Whisper service',
          'PROVIDER_ERROR',
          this.providerName
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new TranscriptionError(
          'Unexpected error during transcription',
          'PROVIDER_ERROR',
          this.providerName
        );
      }
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // Check if Whisper service is accessible
      const response = await axios.get(`${this.whisperUrl}/asr`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  private getExtensionFromMimeType(mimeType: string): string {
    const mimeToExt: { [key: string]: string } = {
      'audio/webm': 'webm',
      'video/webm': 'webm',
      'audio/mp4': 'mp4',
      'video/mp4': 'mp4',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'audio/ogg': 'ogg'
    };
    
    return mimeToExt[mimeType] || 'webm';
  }
}