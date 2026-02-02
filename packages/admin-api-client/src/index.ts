import axios, { AxiosInstance, AxiosError } from 'axios';
import { AuthClient } from './clients/AuthClient';
import { ProductClient } from './clients/ProductClient';
import { VariantClient } from './clients/VariantClient';
import { ImageClient } from './clients/ImageClient';
import { CategoryClient } from './clients/CategoryClient';
import { ReviewClient } from './clients/ReviewClient';
import { CouponClient } from './clients/CouponClient';
import { PaymentClient } from './clients/PaymentClient';
import { RefundClient } from './clients/RefundClient';
import { ReturnClient } from './clients/ReturnClient';
import { InventoryClient } from './clients/InventoryClient';
import { OrderStatusHistoryClient } from './clients/OrderStatusHistoryClient';
import { AnalyticsClient } from './clients/AnalyticsClient';
import { SyncClient } from './clients/SyncClient';

export class AdminApiClient {
  private api: AxiosInstance;
  public auth: AuthClient;
  public products: ProductClient;
  public variants: VariantClient;
  public images: ImageClient;
  public categories: CategoryClient;
  public reviews: ReviewClient;
  public coupons: CouponClient;
  public payments: PaymentClient;
  public refunds: RefundClient;
  public returns: ReturnClient;
  public inventory: InventoryClient;
  public orderStatusHistory: OrderStatusHistoryClient;
  public analytics: AnalyticsClient;
  public sync: SyncClient;

  constructor(baseURL: string = 'http://localhost:3001/api') {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('adminToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Handle token refresh on 401
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const response = await axios.post(`${baseURL}/admin/auth/refresh`);
            const { token } = response.data;

            if (typeof window !== 'undefined') {
              localStorage.setItem('adminToken', token);
            }

            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear storage and redirect to login
            if (typeof window !== 'undefined') {
              localStorage.removeItem('adminToken');
              localStorage.removeItem('adminUser');
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Initialize clients
    this.auth = new AuthClient(this.api);
    this.products = new ProductClient(this.api);
    this.variants = new VariantClient(this.api);
    this.images = new ImageClient(this.api);
    this.categories = new CategoryClient(this.api);
    this.reviews = new ReviewClient(this.api);
    this.coupons = new CouponClient(this.api);
    this.payments = new PaymentClient(this.api);
    this.refunds = new RefundClient(this.api);
    this.returns = new ReturnClient(this.api);
    this.inventory = new InventoryClient(this.api);
    this.orderStatusHistory = new OrderStatusHistoryClient(this.api);
    this.analytics = new AnalyticsClient(this.api);
    this.sync = new SyncClient(this.api);
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminToken', token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken');
    }
    return null;
  }

  clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
  }
}

export default AdminApiClient;
