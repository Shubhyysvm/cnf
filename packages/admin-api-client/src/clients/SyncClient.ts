import { AxiosInstance, AxiosResponse } from 'axios';

export interface SyncResult {
  productId: string;
  variantId?: string;
  orphanedFiles: string[];
  missingFiles: string[];
  syncedFiles: string[];
  errors: string[];
}

export interface SyncSummary {
  totalProducts: number;
  totalImages: number;
  orphanedFiles: number;
  missingFiles: number;
  syncedFiles: number;
  errors: number;
  results: SyncResult[];
}

export interface SyncOptions {
  removeOrphaned?: boolean;
  recreateMissing?: boolean;
}

export class SyncClient {
  constructor(private api: AxiosInstance) {}

  /**
   * Check sync status for a specific product
   */
  async checkProductSync(productId: string): Promise<AxiosResponse<SyncResult>> {
    return this.api.get(`/admin/products/${productId}/images/sync/check`);
  }

  /**
   * Sync a specific product
   */
  async syncProduct(
    productId: string,
    options: SyncOptions = {}
  ): Promise<AxiosResponse<SyncResult>> {
    return this.api.post(`/admin/products/${productId}/images/sync`, options);
  }

  /**
   * Check sync status for all products
   */
  async checkAllProductsSync(): Promise<AxiosResponse<SyncSummary>> {
    return this.api.get('/admin/products/sync/check-all');
  }

  /**
   * Sync all products
   */
  async syncAllProducts(options: SyncOptions = {}): Promise<AxiosResponse<SyncSummary>> {
    return this.api.post('/admin/products/sync/sync-all', options);
  }
}
