/**
 * Document types for S3 file storage
 */

export interface Document {
  id: string;
  name: string;
  type: string; // MIME type
  s3Key: string;
  size: number;
}

export interface PresignedUrlResponse {
  url: string;
  fields?: Record<string, string>;
}

export interface DocumentUploadRequest {
  name: string;
  type: string;
  size: number;
}
