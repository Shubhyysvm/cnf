'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Package, ShoppingCart, AlertCircle, BarChart3, Clock, Eye, Users, Loader } from 'lucide-react';
import { adminApiClient } from '@/lib/api-client';

interface DashboardData {
  kpis?: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
  };
  metrics?: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    fulfilledRate: number;
    lowStockCount: number;
  };
  recentOrders?: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  performance?: {
    conversionRate: number;
    customerSatisfaction: number;
    avgOrderValue: number;
    avgResponseTime: number;
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [kpisRes, metricsRes, ordersRes, perfRes] = await Promise.all([
          adminApiClient.get('/admin/dashboard/kpis', true).catch(() => null),
          adminApiClient.get('/admin/dashboard/metrics', true).catch(() => null),
          adminApiClient.get('/admin/dashboard/recent-orders?limit=5', true).catch(() => null),
          adminApiClient.get('/admin/dashboard/performance', true).catch(() => null),
        ]);

        setData({
          kpis: kpisRes,
          metrics: metricsRes,
          recentOrders: ordersRes,
          performance: perfRes,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const kpis = data.kpis || {};
  const metrics = data.metrics || {};
  const orders = data.recentOrders || [];
  const perf = data.performance || {};

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#2F5233] to-[#3a6b3f] text-white px-6 py-8 mb-8 rounded-b-3xl shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black mb-2">Dashboard</h1>
          <p className="text-emerald-100 text-lg">Welcome back! Here's what's happening with your store today.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-8">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Products Card */}
          <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Package className="w-6 h-6 text-[#2F5233]" />
                </div>
                <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">Active</span>
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Products</p>
              <h3 className="text-3xl font-black text-gray-900 mb-2">{kpis.totalProducts || 0}</h3>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                <TrendingUp className="w-4 h-4" />
                <span>in stock</span>
              </div>
            </div>
          </div>

          {/* Total Orders Card */}
          <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">Live</span>
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Orders</p>
              <h3 className="text-3xl font-black text-gray-900 mb-2">{metrics.totalOrders || 0}</h3>
              <div className="text-gray-500 text-xs">{metrics.pendingOrders || 0} pending</div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">Updated</span>
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">Revenue</p>
              <h3 className="text-3xl font-black text-gray-900 mb-2">₹{((metrics.totalRevenue && typeof metrics.totalRevenue === 'string' ? parseFloat(metrics.totalRevenue) : metrics.totalRevenue) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
              <div className="text-gray-500 text-xs">from {metrics.totalOrders || 0} orders</div>
            </div>
          </div>

          {/* Low Stock Card */}
          <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${(metrics.lowStockCount || 0) > 0 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                  {(metrics.lowStockCount || 0) > 0 ? 'Alert' : 'Good'}
                </span>
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">Low Stock Items</p>
              <h3 className={`text-3xl font-black mb-2 ${(metrics.lowStockCount || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {metrics.lowStockCount || 0}
              </h3>
              <div className="text-gray-500 text-xs">Requires attention</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Add Product */}
            <a
              href="/admin/products/create"
              className="group relative bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-emerald-500 p-6 transition-all duration-300 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
              <div className="relative flex flex-col items-center text-center">
                <div className="p-4 bg-emerald-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">➕</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Add Product</h3>
                <p className="text-sm text-gray-600">Create a new product</p>
              </div>
            </a>

            {/* Manage Orders */}
            <a
              href="/admin/orders"
              className="group relative bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-red-500 p-6 transition-all duration-300 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
              <div className="relative flex flex-col items-center text-center">
                <div className="p-4 bg-red-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Manage Orders</h3>
                <p className="text-sm text-gray-600">View & track orders</p>
              </div>
            </a>

            {/* Manage Products */}
            <a
              href="/admin/products"
              className="group relative bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-500 p-6 transition-all duration-300 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
              <div className="relative flex flex-col items-center text-center">
                <div className="p-4 bg-blue-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📦</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Manage Products</h3>
                <p className="text-sm text-gray-600">Edit & delete products</p>
              </div>
            </a>

            {/* Inventory */}
            <a
              href="/admin/inventory"
              className="group relative bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-purple-500 p-6 transition-all duration-300 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
              <div className="relative flex flex-col items-center text-center">
                <div className="p-4 bg-purple-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Inventory</h3>
                <p className="text-sm text-gray-600">Stock management</p>
              </div>
            </a>

            {/* Categories */}
            <a
              href="/admin/categories"
              className="group relative bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-orange-500 p-6 transition-all duration-300 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
              <div className="relative flex flex-col items-center text-center">
                <div className="p-4 bg-orange-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🏷️</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Categories</h3>
                <p className="text-sm text-gray-600">Manage categories</p>
              </div>
            </a>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Orders Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
              <a href="/admin/orders" className="text-emerald-600 text-sm font-semibold hover:underline">View All</a>
            </div>
            <div className="space-y-3">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <a 
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Order #{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()} • {order.customerName}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900">₹{order.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </a>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No recent orders found</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Performance</h3>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Conversion Rate</span>
                  <span className="text-sm font-bold text-emerald-600">{(perf.conversionRate || 0).toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${Math.min(perf.conversionRate || 0, 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Customer Satisfaction</span>
                  <span className="text-sm font-bold text-blue-600">{(perf.customerSatisfaction || 0).toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600" style={{ width: `${Math.min(perf.customerSatisfaction || 0, 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Avg Order Value</span>
                  <span className="text-sm font-bold text-purple-600">₹{(perf.avgOrderValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fulfillment Rate */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Fulfilled Rate</p>
                <h4 className="text-2xl font-bold text-gray-900">{(metrics.fulfilledRate || 0).toFixed(1)}%</h4>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="text-gray-600 text-xs font-semibold">(Delivered + Cancelled / Total)</div>
          </div>

          {/* Total Customers */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Customers</p>
                <h4 className="text-2xl font-bold text-gray-900">{kpis.totalCustomers || 0}</h4>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-green-600 text-xs font-semibold">↑ Growing</div>
          </div>

          {/* Avg Response Time */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Avg Response Time</p>
                <h4 className="text-2xl font-bold text-gray-900">{(perf.avgResponseTime || 0).toFixed(0)}ms</h4>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-green-600 text-xs font-semibold">✓ Optimal</div>
          </div>
        </div>
      </div>
    </div>
  );
}
