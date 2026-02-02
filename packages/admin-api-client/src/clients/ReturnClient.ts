import { AxiosInstance, AxiosResponse } from 'axios';
import type { ReturnRecord } from '@countrynaturalfoods/admin-types';

export interface ReturnListResponse {
  data: ReturnRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class ReturnClient {
  constructor(private api: AxiosInstance) {}

  async list(page = 1, pageSize = 20): Promise<AxiosResponse<ReturnListResponse>> {
    return this.api.get('/admin/returns', { params: { page, pageSize } });
  }

  async get(id: string): Promise<AxiosResponse<ReturnRecord>> {
    return this.api.get(`/admin/returns/${id}`);
  }
}
