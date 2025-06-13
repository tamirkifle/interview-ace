import * as Minio from 'minio';

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

  getBucketName(): string {
    return this.bucketName;
  }

  getClient(): Minio.Client {
    return this.client;
  }
}

export const minioService = new MinioService();