import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type { LoginResponse, AdminUser } from '@countrynaturalfoods/admin-types';

export class AuthClient {
  constructor(private api: AxiosInstance) {}

  async signup(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<AxiosResponse<LoginResponse>> {
    return this.api.post('/admin/auth/signup', payload);
  }

  async login(email: string, password: string): Promise<AxiosResponse<LoginResponse>> {
    return this.api.post('/admin/auth/login', { email, password });
  }

  async logout(): Promise<AxiosResponse<{ message: string }>> {
    return this.api.post('/admin/auth/logout');
  }

  async me(): Promise<AxiosResponse<AdminUser>> {
    return this.api.get('/admin/auth/me');
  }

  async refreshToken(): Promise<AxiosResponse<{ token: string }>> {
    return this.api.post('/admin/auth/refresh');
  }

  async resetPassword(email: string): Promise<AxiosResponse<{ message: string }>> {
    return this.api.post('/admin/auth/reset-password', { email });
  }
}
