import { AxiosInstance, AxiosResponse } from 'axios';
import type { ReviewRecord } from '@countrynaturalfoods/admin-types';

export interface ReviewListResponse {
  data: ReviewRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class ReviewClient {
  constructor(private api: AxiosInstance) {}

  async list(page = 1, pageSize = 20, status?: string): Promise<AxiosResponse<ReviewListResponse>> {
    return this.api.get('/admin/reviews', { params: { page, pageSize, status } });
  }

  async updateStatus(
    id: string,
    status: 'pending' | 'approved' | 'rejected',
  ): Promise<AxiosResponse<ReviewRecord>> {
    return this.api.patch(`/admin/reviews/${id}/status`, { status });
  }
}
