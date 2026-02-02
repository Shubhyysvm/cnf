import { AxiosInstance, AxiosResponse } from 'axios';
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ApiListResponse,
  ProductFilters,
} from '@countrynaturalfoods/admin-types';

export class ProductClient {
  constructor(private api: AxiosInstance) {}

  async getAll(filters?: ProductFilters): Promise<AxiosResponse<ApiListResponse<Product>>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.page) params.append('page', String(filters.page));
      if (filters.pageSize) params.append('pageSize', String(filters.pageSize));
      if (filters.search) params.append('search', filters.search);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.isFeatured) params.append('isFeatured', String(filters.isFeatured));
      if (filters.isBestSeller) params.append('isBestSeller', String(filters.isBestSeller));
      if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.order) params.append('order', filters.order);
    }
    return this.api.get(`/admin/products?${params.toString()}`);
  }

  async getById(id: string): Promise<AxiosResponse<Product>> {
    return this.api.get(`/admin/products/${id}`);
  }

  async create(data: CreateProductDto): Promise<AxiosResponse<Product>> {
    return this.api.post('/admin/products', data);
  }

  async update(id: string, data: UpdateProductDto): Promise<AxiosResponse<Product>> {
    return this.api.patch(`/admin/products/${id}`, data);
  }

  async delete(id: string): Promise<AxiosResponse<{ message: string }>> {
    return this.api.delete(`/admin/products/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<AxiosResponse<{ deletedCount: number }>> {
    return this.api.post('/admin/products/bulk-delete', { ids });
  }

  async checkSlugAvailability(slug: string): Promise<AxiosResponse<{ available: boolean; normalizedSlug: string; suggestion?: string }>> {
    return this.api.post('/admin/products/check-slug', { slug });
  }
}
