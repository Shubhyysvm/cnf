import { AxiosInstance, AxiosResponse } from 'axios';
import type { CouponRecord } from '@countrynaturalfoods/admin-types';

export interface CouponListResponse {
  data: CouponRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class CouponClient {
  constructor(private api: AxiosInstance) {}

  async list(page = 1, pageSize = 20): Promise<AxiosResponse<CouponListResponse>> {
    return this.api.get('/admin/coupons', { params: { page, pageSize } });
  }

  async get(id: string): Promise<AxiosResponse<CouponRecord>> {
    return this.api.get(`/admin/coupons/${id}`);
  }

  async create(data: Partial<CouponRecord>): Promise<AxiosResponse<CouponRecord>> {
    return this.api.post('/admin/coupons', data);
  }

  async update(id: string, data: Partial<CouponRecord>): Promise<AxiosResponse<CouponRecord>> {
    return this.api.patch(`/admin/coupons/${id}`, data);
  }

  async delete(id: string): Promise<AxiosResponse<{ message: string }>> {
    return this.api.delete(`/admin/coupons/${id}`);
  }
}
