import { AxiosInstance, AxiosResponse } from 'axios';
import type { RefundRecord } from '@countrynaturalfoods/admin-types';

export interface RefundListResponse {
  data: RefundRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class RefundClient {
  constructor(private api: AxiosInstance) {}

  async list(page = 1, pageSize = 20): Promise<AxiosResponse<RefundListResponse>> {
    return this.api.get('/admin/refunds', { params: { page, pageSize } });
  }

  async get(id: string): Promise<AxiosResponse<RefundRecord>> {
    return this.api.get(`/admin/refunds/${id}`);
  }
}
