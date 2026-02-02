import { AxiosInstance, AxiosResponse } from 'axios';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@countrynaturalfoods/admin-types';

export class CategoryClient {
  constructor(private api: AxiosInstance) {}

  async getAll(): Promise<AxiosResponse<Category[]>> {
    return this.api.get('/admin/categories');
  }

  async getById(id: string): Promise<AxiosResponse<Category>> {
    return this.api.get(`/admin/categories/${id}`);
  }

  async create(data: CreateCategoryDto): Promise<AxiosResponse<Category>> {
    return this.api.post('/admin/categories', data);
  }

  async update(id: string, data: UpdateCategoryDto): Promise<AxiosResponse<Category>> {
    return this.api.patch(`/admin/categories/${id}`, data);
  }

  async delete(id: string): Promise<AxiosResponse<{ message: string }>> {
    return this.api.delete(`/admin/categories/${id}`);
  }

  async uploadImage(
    id: string,
    file: File,
  ): Promise<AxiosResponse<{ imageUrl: string; fileName: string; bucket: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post(`/admin/categories/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async deleteImage(id: string, fileName?: string): Promise<AxiosResponse<{ message: string }>> {
    const params = fileName ? { fileName } : undefined;
    return this.api.delete(`/admin/categories/${id}/image`, { params });
  }

  async getPresignedImageUrl(id: string): Promise<AxiosResponse<{ url: string }>> {
    return this.api.get(`/admin/categories/${id}/image/url`);
  }

  async reorder(categoryIds: string[]): Promise<AxiosResponse<{ message: string }>> {
    return this.api.post('/admin/categories/reorder', { categoryIds });
  }
}
