import { AxiosInstance, AxiosResponse } from 'axios';
import type { ProductVariant, CreateVariantDto, UpdateVariantDto } from '@countrynaturalfoods/admin-types';

export class VariantClient {
  constructor(private api: AxiosInstance) {}

  async getByProductId(productId: string): Promise<AxiosResponse<ProductVariant[]>> {
    return this.api.get(`/admin/products/${productId}/variants`);
  }

  async create(productId: string, data: CreateVariantDto): Promise<AxiosResponse<ProductVariant>> {
    return this.api.post(`/admin/products/${productId}/variants`, data);
  }

  async update(
    productId: string,
    variantId: string,
    data: UpdateVariantDto
  ): Promise<AxiosResponse<ProductVariant>> {
    return this.api.patch(`/admin/products/${productId}/variants/${variantId}`, data);
  }

  async delete(productId: string, variantId: string): Promise<AxiosResponse<{ message: string }>> {
    return this.api.delete(`/admin/products/${productId}/variants/${variantId}`);
  }

  async reorder(
    productId: string,
    variantIds: string[]
  ): Promise<AxiosResponse<{ message: string }>> {
    return this.api.post(`/admin/products/${productId}/variants/reorder`, { variantIds });
  }
}
