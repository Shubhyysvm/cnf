import { Injectable } from '@nestjs/common';
import { Client } from 'minio';

@Injectable()
export class MinioService {
  private minioClient: Client;

  constructor() {
    this.minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true' || false,
      accessKey: process.env.MINIO_ROOT_USER || 'countrynaturalfoods',
      secretKey: process.env.MINIO_ROOT_PASSWORD || 'countrynaturalfoods123',
    });
  }

  /**
   * Upload a file to MinIO bucket
   * Returns the public URL for the uploaded file
   */
  async uploadFile(
    file: any,
    bucketName: string = 'country-natural-foods',
    prefix?: string,
  ): Promise<{
    url: string;
    fileName: string; // object key (may include prefix)
    bucketName: string;
  }> {
    try {
      // Ensure bucket exists
      const bucketExists = await this.minioClient.bucketExists(bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(bucketName, 'us-east-1');
      }

      // Generate unique filename: timestamp-uuid-originalname
      const fileExt = file.originalname.split('.').pop();
      const { v4: uuid } = await import('uuid');
      const uniqueBaseName = `${Date.now()}-${uuid()}.${fileExt}`;
      const objectName = prefix ? `${prefix}/${uniqueBaseName}` : uniqueBaseName;

      // Upload file to MinIO
      await this.minioClient.putObject(
        bucketName,
        objectName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        },
      );

      // Generate public URL
      const url = `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${
        process.env.MINIO_PORT || '9000'
      }/${bucketName}/${objectName}`;

      return { url, fileName: objectName, bucketName };
    } catch (error: any) {
      console.error('MinIO upload error:', error);
      throw new Error(`Failed to upload file: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Delete a file from MinIO bucket
   */
  async deleteFile(
    fileName: string,
    bucketName: string = 'country-natural-foods',
  ): Promise<void> {
    try {
      await this.minioClient.removeObject(bucketName, fileName);
    } catch (error: any) {
      console.error('MinIO delete error:', error);
      throw new Error(`Failed to delete file: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Get presigned download URL (lasts 24 hours)
   */
  async getPresignedUrl(
    fileName: string,
    bucketName: string = 'country-natural-foods',
    expirySeconds: number = 86400,
  ): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(
        bucketName,
        fileName,
        expirySeconds,
      );
    } catch (error: any) {
      console.error('MinIO presigned URL error:', error);
      throw new Error(`Failed to generate presigned URL: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * List all files in a bucket with optional prefix
   */
  async listFiles(
    bucketName: string = 'country-natural-foods',
    prefix?: string,
  ): Promise<string[]> {
    try {
      const files: string[] = [];
      const stream = this.minioClient.listObjects(bucketName, prefix, true);

      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
          if (obj.name) {
            files.push(obj.name);
          }
        });
        stream.on('end', () => resolve(files));
        stream.on('error', (err) => reject(err));
      });
    } catch (error: any) {
      console.error('MinIO list files error:', error);
      throw new Error(`Failed to list files: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Get public URL for a file
   */
  async getFileUrl(
    fileName: string,
    bucketName: string = 'country-natural-foods',
  ): Promise<string> {
    return `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${
      process.env.MINIO_PORT || '9000'
    }/${bucketName}/${fileName}`;
  }

  /**
   * Copy a file from one location to another within MinIO
   */
  async copyFile(
    sourceFileName: string,
    destFileName: string,
    sourceBucket: string = 'country-natural-foods',
    destBucket: string = 'country-natural-foods',
  ): Promise<void> {
    try {
      await this.minioClient.copyObject(
        destBucket,
        destFileName,
        `/${sourceBucket}/${sourceFileName}`,
      );
    } catch (error: any) {
      console.error('MinIO copy error:', error);
      throw new Error(`Failed to copy file: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Check if a file exists in MinIO
   */
  async fileExists(
    fileName: string,
    bucketName: string = 'country-natural-foods',
  ): Promise<boolean> {
    try {
      await this.minioClient.statObject(bucketName, fileName);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get a file stream from MinIO for direct proxying
   */
  async getFileStream(
    fileName: string,
    bucketName: string = 'country-natural-foods',
  ): Promise<any> {
    try {
      return await this.minioClient.getObject(bucketName, fileName);
    } catch (error: any) {
      console.error('MinIO get stream error:', error);
      throw new Error(`Failed to get file stream: ${error?.message || 'Unknown error'}`);
    }
  }
}
