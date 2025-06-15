import { minioService } from '../minioService';
import { transcriptionService } from './transcriptionService';
import { TranscriptionContext, TranscriptionStatus } from './types';
import { Readable } from 'stream';

export class TranscriptionJobProcessor {
  async processRecording(
    recordingId: string,
    minioKey: string,
    context: TranscriptionContext
  ): Promise<void> {
    // Check if transcription is requested
    if (!context.provider || !context.apiKey) {
      console.log(`No transcription requested for recording ${recordingId}`);
      await transcriptionService.updateRecordingStatus(recordingId, 'NONE');
      return;
    }

    try {
      // Update status to pending
      await transcriptionService.updateRecordingStatus(recordingId, 'PENDING');
      
      // Download video from MinIO
      const videoBuffer = await this.downloadVideo(minioKey);
      
      // Update status to processing
      await transcriptionService.updateRecordingStatus(recordingId, 'PROCESSING');
      
      // Get MIME type from file extension
      const mimeType = this.getMimeType(minioKey);
      
      // Transcribe using the provided context
      const result = await transcriptionService.transcribe(
        videoBuffer,
        mimeType,
        context
      );
      
      if (result) {
        // Update recording with transcript
        await transcriptionService.updateRecordingTranscript(
          recordingId,
          result.transcript,
          'COMPLETED'
        );
        console.log(`Transcription completed for recording ${recordingId}`);
      } else {
        // No transcription result (shouldn't happen if context is provided)
        await transcriptionService.updateRecordingStatus(recordingId, 'FAILED');
      }
    } catch (error) {
      console.error(`Transcription failed for recording ${recordingId}:`, error);
      await transcriptionService.updateRecordingStatus(recordingId, 'FAILED');
    }
  }

  private async downloadVideo(minioKey: string): Promise<Buffer> {
    const client = minioService.getClient();
    const bucketName = minioService.getBucketName();
    
    try {
      // getObject returns a Promise that resolves to a stream
      const stream = await client.getObject(bucketName, minioKey);
      
      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Failed to download video ${minioKey}: ${error}`);
    }
  }

  private getMimeType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'webm':
        return 'video/webm';
      case 'mp4':
        return 'video/mp4';
      case 'mp3':
        return 'audio/mpeg';
      case 'wav':
        return 'audio/wav';
      default:
        return 'video/webm'; // Default to webm
    }
  }
}

export const transcriptionJobProcessor = new TranscriptionJobProcessor();