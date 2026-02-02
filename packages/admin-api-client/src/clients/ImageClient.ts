import { AxiosInstance, AxiosResponse } from 'axios';
import type { ProductImage, UploadImageDto } from '@countrynaturalfoods/admin-types';

export class ImageClient {
  constructor(private api: AxiosInstance) {}

  async uploadImage(
    productId: string,
    file: File,
    metadata?: UploadImageDto
  ): Promise<AxiosResponse<ProductImage>> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata?.altText) formData.append('altText', metadata.altText);

    return this.api.post(`/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async uploadVariantImage(
    productId: string,
    variantId: string,
    imageType: 'hero-card' | 'info-card' | 'other',
    file: File,
    metadata?: Partial<UploadImageDto> & { variantWeight?: string }
  ): Promise<AxiosResponse<ProductImage>> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata?.altText) formData.append('altText', metadata.altText);
    if (metadata?.variantWeight) formData.append('variantWeight', metadata.variantWeight);

    return this.api.post(
      `/admin/products/${productId}/variants/${variantId}/images/${imageType}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  }

  async uploadMultiple(
    productId: string,
    files: File[]
  ): Promise<AxiosResponse<ProductImage[]>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    return this.api.post(`/admin/products/${productId}/images/batch`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async updateImage(
    productId: string,
    imageId: string,
    data: Partial<UploadImageDto>
  ): Promise<AxiosResponse<ProductImage>> {
    return this.api.patch(`/admin/products/${productId}/images/${imageId}`, data);
  }

  async setDefault(productId: string, imageId: string): Promise<AxiosResponse<ProductImage>> {
    return this.api.patch(`/admin/products/${productId}/images/${imageId}/set-default`);
  }

  async deleteImage(productId: string, imageId: string): Promise<AxiosResponse<{ message: string }>> {
    return this.api.post(`/products/${productId}/images/${imageId}/delete`);
  }

  async deleteVariantImage(
    productId: string,
    variantId: string,
    imageType: string,
    imageId: string
  ): Promise<AxiosResponse<{ message: string }>> {
    return this.api.delete(
      `/admin/products/${productId}/variants/${variantId}/images/${imageType}/${imageId}`
    );
  }

  async replaceImage(
    productId: string,
    imageId: string,
    file: File
  ): Promise<AxiosResponse<{ message: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.patch(`/products/${productId}/images/${imageId}/replace`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async reorderImages(
    productId: string,
    imageIds: string[]
  ): Promise<AxiosResponse<{ message: string }>> {
    return this.api.post(`/admin/products/${productId}/images/reorder`, { imageIds });
  }
}
