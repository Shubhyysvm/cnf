import { AxiosInstance, AxiosResponse } from 'axios';
import type { OrderStatusHistoryRecord } from '@countrynaturalfoods/admin-types';

export interface OrderStatusHistoryListResponse {
  data: OrderStatusHistoryRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class OrderStatusHistoryClient {
  constructor(private api: AxiosInstance) {}

  async listByOrder(
    orderId: string,
    page = 1,
    pageSize = 50,
  ): Promise<AxiosResponse<OrderStatusHistoryListResponse>> {
    return this.api.get('/admin/order-status-history', { params: { orderId, page, pageSize } });
  }
}
