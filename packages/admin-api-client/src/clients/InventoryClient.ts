import { AxiosInstance, AxiosResponse } from 'axios';
import type { InventoryMovementRecord, InventoryReservationRecord } from '@countrynaturalfoods/admin-types';

export interface InventoryMovementListResponse {
  data: InventoryMovementRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface InventoryReservationListResponse {
  data: InventoryReservationRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class InventoryClient {
  constructor(private api: AxiosInstance) {}

  async listMovements(
    page = 1,
    pageSize = 20,
    variantId?: string,
  ): Promise<AxiosResponse<InventoryMovementListResponse>> {
    return this.api.get('/admin/inventory/movements', { params: { page, pageSize, variantId } });
  }

  async listReservations(
    page = 1,
    pageSize = 20,
    variantId?: string,
  ): Promise<AxiosResponse<InventoryReservationListResponse>> {
    return this.api.get('/admin/inventory/reservations', { params: { page, pageSize, variantId } });
  }
}
