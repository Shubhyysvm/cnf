import { AxiosInstance, AxiosResponse } from 'axios';
import type { PaymentRecord } from '@countrynaturalfoods/admin-types';

export interface PaymentListResponse {
  data: PaymentRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class PaymentClient {
  constructor(private api: AxiosInstance) {}

  async list(page = 1, pageSize = 20): Promise<AxiosResponse<PaymentListResponse>> {
    return this.api.get('/admin/payments', { params: { page, pageSize } });
  }

  async get(id: string): Promise<AxiosResponse<PaymentRecord>> {
    return this.api.get(`/admin/payments/${id}`);
  }
}
