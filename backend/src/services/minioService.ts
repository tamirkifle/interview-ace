import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

class MinioService {
  private client: Minio.Client;
  private bucketName: string = process.env.MINIO_BUCKET || 'recordings';

  constructor() {
    this.client = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
      secretKey: process.env.MINIO_SECRET_KEY || 'password123'
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      // Try to list buckets as a connection test
      const buckets = await this.client.listBuckets();
      console.log('MinIO connected. Found buckets:', buckets.map(b => b.name).join(', '));
      return true;
    } catch (error) {
      console.error('MinIO connection failed:', error);
      return false;
    }
  }

  async ensureBucketExists(): Promise<void> {
    try {
      const exists = await this.client.bucketExists(this.bucketName);
      if (!exists) {
        await this.client.makeBucket(this.bucketName, 'us-east-1');
        console.log(`MinIO bucket '${this.bucketName}' created`);
        
        // Set bucket policy to allow public read (optional, for playback)
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`]
            }
          ]
        };
        
        await this.client.setBucketPolicy(this.bucketName, JSON.stringify(policy));
        console.log(`MinIO bucket '${this.bucketName}' policy set`);
      } else {
        console.log(`MinIO bucket '${this.bucketName}' already exists`);
      }
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      throw error;
    }
  }

  generateUniqueFilename(originalName: string): string {
    const extension = originalName.split('.').pop() || 'webm';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const uniqueId = uuidv4().substring(0, 8);
    return `recording_${timestamp}_${uniqueId}.${extension}`;
  }

  async uploadVideo(buffer: Buffer, filename: string): Promise<string> {
    try {
      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      if (buffer.length > maxSize) {
        throw new Error('File size exceeds 100MB limit');
      }

      const uniqueFilename = this.generateUniqueFilename(filename);
      
      // Upload to MinIO
      await this.client.putObject(
        this.bucketName,
        uniqueFilename,
        buffer,
        buffer.length,
        {
          'Content-Type': 'video/webm',
          'X-Original-Filename': filename
        }
      );

      console.log(`Video uploaded successfully: ${uniqueFilename}`);
      return uniqueFilename;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  }

  async getVideoUrl(key: string): Promise<string> {
    try {
      // Generate a presigned URL valid for 7 days
      const url = await this.client.presignedGetObject(
        this.bucketName,
        key,
        7 * 24 * 60 * 60 // 7 days in seconds
      );
      return url;
    } catch (error) {
      console.error('Error generating video URL:', error);
      throw error;
    }
  }

  async deleteVideo(key: string): Promise<boolean> {
    try {
      await this.client.removeObject(this.bucketName, key);
      console.log(`Video deleted: ${key}`);
      return true;
    } catch (error) {
      console.error('Error deleting video:', error);
      return false;
    }
  }

  getBucketName(): string {
    return this.bucketName;
  }

  getClient(): Minio.Client {
    return this.client;
  }
}

export const minioService = new MinioService();