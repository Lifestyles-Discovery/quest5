import axios from 'axios';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Document, PresignedUrlResponse } from '@app-types/document.types';

/**
 * Documents service for S3 file management
 * Note: Liberator API expects parameters via headers, not request body
 */
export const documentsService = {
  /**
   * Get a presigned URL for uploading to S3
   * API expects: filename, filetype via headers (GET request)
   */
  async getPresignedUrl(
    propertyId: string,
    filename: string,
    filetype: string
  ): Promise<PresignedUrlResponse> {
    const response = await apiClient.get<PresignedUrlResponse>(
      ENDPOINTS.documents.presignedUrl(propertyId),
      {
        headers: {
          filename,
          filetype,
        },
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
   * API expects: name, type, s3Key, size via headers
   */
  async registerDocument(
    propertyId: string,
    document: { name: string; type: string; size: number; s3Key: string }
  ): Promise<Document> {
    const response = await apiClient.post<Document>(
      ENDPOINTS.documents.register(propertyId),
      null, // No body
      {
        headers: {
          name: document.name,
          type: document.type,
          s3Key: document.s3Key,
          size: String(document.size),
        },
      }
    );
    return response.data;
  },

  /**
   * Get download URL for a document
   * API returns the URL string directly
   */
  async getDocumentUrl(
    propertyId: string,
    documentId: string
  ): Promise<{ url: string }> {
    const response = await apiClient.get<string>(
      ENDPOINTS.documents.getUrl(propertyId, documentId)
    );
    // API returns just the URL string, wrap it in an object
    return { url: response.data };
  },

  /**
   * Update document name
   * API expects: name via header
   */
  async updateDocumentName(
    propertyId: string,
    documentId: string,
    name: string
  ): Promise<Document> {
    const response = await apiClient.put<Document>(
      ENDPOINTS.documents.updateName(propertyId, documentId),
      null, // No body
      {
        headers: {
          name,
        },
      }
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
    const { url, s3Key } = await this.getPresignedUrl(
      propertyId,
      file.name,
      file.type
    );

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
