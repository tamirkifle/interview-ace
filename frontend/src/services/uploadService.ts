interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
  }
  
  interface UploadResult {
    success: boolean;
    minioKey: string;
    originalName: string;
    size: number;
  }
  
  export class UploadService {
    private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
    async uploadRecording(
      blob: Blob, 
      filename: string,
      onProgress?: (progress: UploadProgress) => void
    ): Promise<UploadResult> {
      try {
        const formData = new FormData();
        formData.append('video', blob, filename);
  
        const xhr = new XMLHttpRequest();
  
        return new Promise((resolve, reject) => {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable && onProgress) {
              const progress: UploadProgress = {
                loaded: event.loaded,
                total: event.total,
                percentage: Math.round((event.loaded / event.total) * 100)
              };
              onProgress(progress);
            }
          });
  
          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch (error) {
                reject(new Error('Invalid response format'));
              }
            } else {
              try {
                const error = JSON.parse(xhr.responseText);
                reject(new Error(error.error || `Upload failed with status ${xhr.status}`));
              } catch {
                reject(new Error(`Upload failed with status ${xhr.status}`));
              }
            }
          });
  
          xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'));
          });
  
          xhr.addEventListener('abort', () => {
            reject(new Error('Upload cancelled'));
          });
  
          xhr.open('POST', `${this.baseUrl}/api/upload-video`);
          xhr.send(formData);
        });
      } catch (error) {
        console.error('Upload error:', error);
        throw error;
      }
    }
  }
  
  export const uploadService = new UploadService();