import axios from 'axios';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Document, PresignedUrlResponse } from '@app-types/document.types';

/**
 * Documents service for S3 file management
 */
export const documentsService = {
  /**
   * Get a presigned URL for uploading to S3
   */
  async getPresignedUrl(
    propertyId: string,
    filename: string,
    filetype: string
  ): Promise<PresignedUrlResponse> {
    const response = await apiClient.get<PresignedUrlResponse>(
      ENDPOINTS.documents.presignedUrl(propertyId),
      {
        params: { filename, filetype },
      }
    );
    return response.data;
  },

  /**
   * Upload file directly to S3 using presigned URL
   */
  async uploadToS3(presignedUrl: string, file: File): Promise<void> {
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
  },

  /**
   * Register a document after S3 upload
   */
  async registerDocument(
    propertyId: string,
    document: { name: string; type: string; size: number; s3Key: string }
  ): Promise<Document> {
    const response = await apiClient.post<Document>(
      ENDPOINTS.documents.register(propertyId),
      document
    );
    return response.data;
  },

  /**
   * Get download URL for a document
   */
  async getDocumentUrl(
    propertyId: string,
    documentId: string
  ): Promise<{ url: string }> {
    const response = await apiClient.get<{ url: string }>(
      ENDPOINTS.documents.getUrl(propertyId, documentId)
    );
    return response.data;
  },

  /**
   * Update document name
   */
  async updateDocumentName(
    propertyId: string,
    documentId: string,
    name: string
  ): Promise<Document> {
    const response = await apiClient.put<Document>(
      ENDPOINTS.documents.updateName(propertyId, documentId),
      { name }
    );
    return response.data;
  },

  /**
   * Delete a document
   */
  async deleteDocument(propertyId: string, documentId: string): Promise<void> {
    await apiClient.delete(ENDPOINTS.documents.delete(propertyId, documentId));
  },

  /**
   * Upload a file (combines all steps: get presigned URL, upload to S3, register)
   */
  async uploadFile(propertyId: string, file: File): Promise<Document> {
    // Get presigned URL
    const { url } = await this.getPresignedUrl(
      propertyId,
      file.name,
      file.type
    );

    // Extract S3 key from URL
    const s3Key = new URL(url).pathname.slice(1);

    // Upload to S3
    await this.uploadToS3(url, file);

    // Register document
    return this.registerDocument(propertyId, {
      name: file.name,
      type: file.type,
      size: file.size,
      s3Key,
    });
  },
};
