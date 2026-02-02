import { AxiosInstance, AxiosResponse } from 'axios';
import type {
  SearchLogRecord,
  AddToCartEventRecord,
  CheckoutAbandonmentRecord,
} from '@countrynaturalfoods/admin-types';

export interface SearchLogsListResponse {
  data: SearchLogRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AddToCartEventsListResponse {
  data: AddToCartEventRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CheckoutAbandonmentsListResponse {
  data: CheckoutAbandonmentRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class AnalyticsClient {
  constructor(private api: AxiosInstance) {}

  async listSearchLogs(page = 1, pageSize = 20): Promise<AxiosResponse<SearchLogsListResponse>> {
    return this.api.get('/admin/analytics/search-logs', { params: { page, pageSize } });
  }

  async listAddToCartEvents(
    page = 1,
    pageSize = 20,
  ): Promise<AxiosResponse<AddToCartEventsListResponse>> {
    return this.api.get('/admin/analytics/add-to-cart-events', { params: { page, pageSize } });
  }

  async listCheckoutAbandonments(
    page = 1,
    pageSize = 20,
  ): Promise<AxiosResponse<CheckoutAbandonmentsListResponse>> {
    return this.api.get('/admin/analytics/checkout-abandonments', { params: { page, pageSize } });
  }
}
