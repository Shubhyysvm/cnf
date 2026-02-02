'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApiClient } from '@/lib/api-client';
import {
  Search,
  ChevronRight,
  Calendar,
  IndianRupee,
  Download,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  Loader,
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount?: number;
  total?: number;
  subtotal?: number;
  shippingCost?: number;
  itemsCount?: number;
  items?: { id?: string }[];
  shippingCity?: string;
  paymentStatus?: string;
  createdAt?: string;
  created_at?: string;
}

interface OrderMetrics {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  fulfilledRate: number;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  pending: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    icon: <Clock className="w-4 h-4" />,
  },
  confirmed: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  shipped: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: <Truck className="w-4 h-4" />,
  },
  out_for_delivery: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: <Truck className="w-4 h-4" />,
  },
  delivered: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  cancelled: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: <XCircle className="w-4 h-4" />,
  },
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<OrderMetrics>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    fulfilledRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Apply filters and search whenever dependencies change
  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, selectedStatus, sortBy]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminApiClient.get('/orders', true);  // true = admin view (fetch all orders)
      // Backend returns direct array of orders, not wrapped in { data: {...} }
      const ordersData = Array.isArray(response) ? response : response.data || [];
      setOrders(ordersData);
      calculateMetrics(ordersData);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (ordersData: Order[]) => {
    const totalOrders = ordersData.length;
    const totalRevenue = ordersData.reduce((sum, order) => {
      const amount = Number(order.total ?? order.totalAmount ?? order.subtotal ?? 0);
      return sum + amount;
    }, 0);
    const pendingOrders = ordersData.filter((o) => o.status === 'pending').length;
    const fulfilledOrders = ordersData.filter(
      (o) => o.status === 'delivered' || o.status === 'cancelled'
    ).length;
    const fulfilledRate = totalOrders > 0 ? Math.round((fulfilledOrders / totalOrders) * 100) : 0;

    setMetrics({
      totalOrders,
      totalRevenue,
      pendingOrders,
      fulfilledRate,
    });
  };

  const applyFilters = () => {
    let result = [...orders];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(term) ||
          order.customerName?.toLowerCase().includes(term) ||
          order.customerEmail?.toLowerCase().includes(term) ||
          order.customerPhone?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (selectedStatus) {
      result = result.filter((order) => order.status === selectedStatus);
    }

    // Sorting
    if (sortBy === 'date') {
      result.sort(
        (a, b) => new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime()
      );
    } else if (sortBy === 'amount') {
      const amt = (o: Order) => Number(o.totalAmount ?? o.total ?? o.subtotal ?? o.shippingCost ?? 0);
      result.sort((a, b) => amt(b) - amt(a));
    } else if (sortBy === 'status') {
      result.sort((a, b) => a.status.localeCompare(b.status));
    }

    setFilteredOrders(result);
  };

  const statusOptions = ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
  const statusCounts = statusOptions.map((status) => ({
    status,
    count: orders.filter((o) => o.status === status).length,
  }));

  const exportToCSV = () => {
    const headers = ['Order Number', 'Customer', 'Email', 'Phone', 'Amount', 'Status', 'Date', 'Items'];
    const rows = filteredOrders.map((order) => [
      order.orderNumber,
      order.customerName,
      order.customerEmail,
      order.customerPhone,
      `₹${order.totalAmount}`,
      order.status,
      new Date(order.createdAt || order.created_at || '').toLocaleDateString(),
      order.itemsCount,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => (typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell)).join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Loader className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600">Manage, track, and fulfill all customer orders in one place</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalOrders}</p>
            </div>
            <Package className="w-12 h-12 text-blue-100 rounded-lg p-2" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹{metrics.totalRevenue.toLocaleString()}</p>
            </div>
            <IndianRupee className="w-12 h-12 text-green-100 rounded-lg p-2" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Orders</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{metrics.pendingOrders}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-100 rounded-lg p-2" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Fulfilled Rate</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{metrics.fulfilledRate}%</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-100 rounded-lg p-2" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order #, customer name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Export Button */}
          <button
            onClick={exportToCSV}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus(null)}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              selectedStatus === null
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Orders
          </button>
          {statusCounts.map(({ status, count }) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-full font-medium transition-all capitalize ${
                selectedStatus === status
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status} ({count})
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex gap-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'status')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          >
            <option value="date">Newest First</option>
            <option value="amount">Highest Amount</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const statusConfig = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
            const totalAmount = Number(
              order.totalAmount ?? order.total ?? order.subtotal ?? order.shippingCost ?? 0
            );
            const itemsCount = order.itemsCount ?? order.items?.length ?? 0;
            const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();

            const quickActions: { label: string; nextStatus: string }[] = (() => {
              switch (order.status) {
                case 'pending':
                  return [
                    { label: 'Confirm', nextStatus: 'confirmed' },
                    { label: 'Cancel', nextStatus: 'cancelled' },
                  ];
                case 'confirmed':
                  return [
                    { label: 'Ship', nextStatus: 'shipped' },
                    { label: 'Cancel', nextStatus: 'cancelled' },
                  ];
                case 'shipped':
                  return [
                    { label: 'Out for Delivery', nextStatus: 'out_for_delivery' },
                    { label: 'Cancel', nextStatus: 'cancelled' },
                  ];
                case 'out_for_delivery':
                  return [
                    { label: 'Delivered', nextStatus: 'delivered' },
                    { label: 'Cancel', nextStatus: 'cancelled' },
                  ];
                case 'delivered':
                  return [{ label: 'Return / Refund', nextStatus: 'cancelled' }];
                default:
                  return [];
              }
            })();

            const handleQuickAction = async (e: React.MouseEvent, nextStatus: string) => {
              e.stopPropagation();
              try {
                await adminApiClient.patch(`/orders/${order.id}/status`, { status: nextStatus });
                await fetchOrders();
              } catch (err) {
                console.error('Quick action failed', err);
              }
            };

            return (
              <div
                key={order.id}
                onClick={() => router.push(`/admin/orders/${order.id}`)}
                className="block group cursor-pointer"
              >
                <div
                  className={`${statusConfig.bg} border-2 ${statusConfig.border} rounded-lg p-5 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Row 1: Order Number, Status, Date */}
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className={`${statusConfig.text}`}>{statusConfig.icon}</div>
                          <div>
                            <p className="font-bold text-lg text-gray-900">
                              {order.orderNumber || `Order #${order.id.slice(0, 8)}`}
                            </p>
                            <p className={`text-sm font-semibold ${statusConfig.text} capitalize`}>
                              {order.status}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Calendar className="w-4 h-4" />
                          {createdAt.toLocaleDateString()}
                        </div>
                      </div>

                      {/* Row 2: Customer Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Customer</p>
                          <p className="text-sm font-semibold text-gray-900">{order.customerName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Contact</p>
                          <p className="text-sm font-semibold text-gray-900">{order.customerPhone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Payment</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {order.paymentStatus || order.customerEmail || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Row 3: Amount, Items, Quick Actions */}
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 text-emerald-600 font-bold">
                          <IndianRupee className="w-5 h-5" />
                          ₹{totalAmount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold">{itemsCount} item(s)</span>
                        </div>
                        {quickActions.length > 0 && (
                          <div className="flex flex-wrap gap-2 ml-auto">
                            {quickActions.map((action) => (
                              <button
                                key={`${order.id}-${action.label}`}
                                onClick={(e) => handleQuickAction(e, action.nextStatus)}
                                className="px-3 py-2 text-sm font-semibold rounded-lg border border-emerald-500 text-emerald-700 bg-white hover:bg-emerald-50 transition-colors shadow-sm"
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* View Button */}
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-emerald-600 transition-colors ml-4 flex-shrink-0" />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900">No orders found</p>
            <p className="text-gray-600 mt-2">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {filteredOrders.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-center">
            <p className="text-sm font-medium text-gray-700">
              Showing <span className="font-bold text-gray-900">{filteredOrders.length}</span> of{' '}
              <span className="font-bold text-gray-900">{orders.length}</span> orders
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
