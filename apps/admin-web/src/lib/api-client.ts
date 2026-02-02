import { AdminApiClient } from '@countrynaturalfoods/admin-api-client';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const client = new AdminApiClient(baseURL);

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const getHeaders = (adminView: boolean = false) => {
  const token = getToken();
  const headers: any = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  
  // Add admin view header for orders endpoint
  if (adminView) {
    headers['x-admin-view'] = 'true';
  }
  
  return headers;
};

// Wrapper to add missing methods to AdminApiClient
export const adminApiClient = {
  ...client,
  
  async get(endpoint: string, adminView: boolean = false) {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(adminView),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (err) {
      console.error('Failed to parse JSON', err);
      throw new Error('Invalid JSON response');
    }
  },

  async post(endpoint: string, data: any) {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },

  async patch(endpoint: string, data: any) {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },

  async delete(endpoint: string) {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },
};
