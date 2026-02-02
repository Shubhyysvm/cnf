'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApiClient } from '@/lib/api-client';
import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  Package,
  User,
  Phone,
  MapPin,
  Mail,
  CheckCircle2,
  Clock,
  Truck,
  X,
  Plus,
  Edit2,
  MessageSquare,
  Printer,
  Share2,
  Loader,
} from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantWeight: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  totalAmount?: number;
  total?: number;
  subtotal?: number;
  shippingCost?: number;
  tax?: number;
  discountAmount?: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress?: {
    name?: string;
    recipientName?: string;
    street?: string;
    line1?: string;
    apartment?: string;
    line2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    zip?: string;
    phone?: string;
  };
  billingAddress?: {
    name?: string;
    recipientName?: string;
    street?: string;
    line1?: string;
    apartment?: string;
    line2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    zip?: string;
  };
  items?: OrderItem[];
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Note {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  createdBy: string;
}

const STATUS_COLORS: Record<string, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  pending: {
    label: 'Pending',
    icon: <Clock className="w-5 h-5" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  confirmed: {
    label: 'Confirmed',
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  shipped: {
    label: 'Shipped',
    icon: <Truck className="w-5 h-5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    icon: <Truck className="w-5 h-5" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  delivered: {
    label: 'Delivered',
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  cancelled: {
    label: 'Cancelled',
    icon: <X className="w-5 h-5" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await adminApiClient.get(`/orders/${orderId}`);
      // Backend returns order directly or wrapped - handle both
      if (!response) {
        console.error('Empty response from API');
        return;
      }
      const orderData = response.data || response;
      setOrder(orderData);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!order || updating) return;

    try {
      setUpdating(true);
      await adminApiClient.patch(`/orders/${orderId}/status`, {
        status,
        reason: statusReason,
      });
      await fetchOrderDetail();
      setShowStatusModal(false);
      setStatusReason('');
      setNewStatus('');
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !order) return;

    try {
      setUpdating(true);
      await adminApiClient.post(`/orders/${orderId}/notes`, {
        content: newNote,
        isInternal: true,
      });
      setNewNote('');
      setShowNotesModal(false);
      // Refetch notes/order
      await fetchOrderDetail();
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Loader className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Order not found</p>
      </div>
    );
  }

  const statusConfig = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
  const nextStatuses = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['out_for_delivery', 'cancelled'],
    out_for_delivery: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
  } as const;

  const safeItems = order.items || [];
  const safeSubtotal = Number(order.subtotal ?? 0);
  const safeShipping = Number(order.shippingCost ?? 0);
  const safeTax = Number(order.tax ?? 0);
  const safeDiscount = Number(order.discountAmount ?? 0);
  const safeTotal = Number(order.totalAmount ?? order.total ?? safeSubtotal + safeShipping + safeTax - safeDiscount);
  const safeShippingAddress = order.shippingAddress || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/orders')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{order.orderNumber}</h1>
            <p className="text-gray-600 mt-1">Order placed on {new Date(order.createdAt || '').toLocaleDateString()}</p>
          </div>
        </div>
        <div className={`${statusConfig.bgColor} ${statusConfig.color} px-6 py-3 rounded-lg flex items-center gap-2 font-bold`}>
          {statusConfig.icon}
          {statusConfig.label}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Status Timeline</h2>
            <div className="space-y-4">
              {['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'].map((status, index) => {
                const flow = ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];
                const statusIndex = flow.indexOf(status);
                const currentIndex = flow.indexOf(order.status);
                const isCompleted = currentIndex >= statusIndex;
                const isCurrent = order.status === status;
                const statusInfo = STATUS_COLORS[status];

                return (
                  <div key={status} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                          isCompleted
                            ? `${statusInfo.bgColor} ${statusInfo.color}`
                            : 'bg-gray-200 text-gray-600'
                        } ${isCurrent ? 'ring-4 ring-emerald-300 shadow-lg' : ''}`}
                      >
                        {statusInfo.icon}
                      </div>
                      {index < flow.length - 1 && (
                        <div
                          className={`w-1 h-12 mt-2 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-gray-300'
                          }`}
                        ></div>
                      )}
                    </div>
                    <div className="flex-1 pt-2">
                      <p className={`font-semibold text-lg ${isCurrent ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {statusInfo.label}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-gray-500 mt-1">Current • Updated {new Date(order.updatedAt || '').toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Items ({safeItems.length})</h2>
            <div className="space-y-4">
              {safeItems.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                  {item.imageUrl && (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-600">{item.variantWeight}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm text-gray-600">Qty: <span className="font-bold">{item.quantity}</span></span>
                      <span className="text-sm text-gray-600">₹{(item.price).toLocaleString()}</span>
                      <span className="font-bold text-emerald-600">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Addresses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-600" />
                  Shipping Address
                </h3>
                <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-3 rounded">
                  <p className="font-semibold text-gray-900">{safeShippingAddress.name || safeShippingAddress.recipientName || order.customerName}</p>
                  <p>{safeShippingAddress.street || safeShippingAddress.line1 || '—'}</p>
                  <p>{safeShippingAddress.apartment || safeShippingAddress.line2 ? `${safeShippingAddress.apartment || safeShippingAddress.line2}` : ''}</p>
                  <p>{[safeShippingAddress.city, safeShippingAddress.state, safeShippingAddress.zipCode || safeShippingAddress.zip].filter(Boolean).join(', ') || '—'}</p>
                  <p className="font-semibold text-gray-900 mt-2">{safeShippingAddress.phone || order.customerPhone}</p>
                </div>
              </div>

              {/* Billing Address */}
              {order.billingAddress && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Billing Address
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1 bg-blue-50 p-3 rounded">
                    <p className="font-semibold text-gray-900">{order.billingAddress.name || order.billingAddress.recipientName || order.customerName}</p>
                    <p>{order.billingAddress.street || order.billingAddress.line1 || '—'}</p>
                    <p>{order.billingAddress.apartment || order.billingAddress.line2 ? `${order.billingAddress.apartment || order.billingAddress.line2}` : ''}</p>
                    <p>{[order.billingAddress.city, order.billingAddress.state, order.billingAddress.zipCode || order.billingAddress.zip].filter(Boolean).join(', ') || '—'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customer Details Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Customer Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-600 font-medium">Name</p>
                <p className="font-semibold text-gray-900">{order.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Email</p>
                <p className="font-semibold text-blue-600 cursor-pointer hover:underline">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Phone</p>
                <p className="font-semibold text-gray-900">{order.customerPhone}</p>
              </div>
            </div>
          </div>

          {/* Internal Notes Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Internal Notes</h2>
              <button
                onClick={() => setShowNotesModal(true)}
                className="px-3 py-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-1 font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Note
              </button>
            </div>
            {notes.length > 0 ? (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-gray-900">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-2">Added by {note.createdBy} • {new Date(note.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No internal notes yet. Add notes to track important order information.</p>
            )}
          </div>
        </div>

        {/* Right Sidebar (1 column) */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₹{safeSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">₹{safeShipping.toLocaleString()}</span>
              </div>
              {safeTax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">₹{safeTax.toLocaleString()}</span>
                </div>
              )}
              {safeDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-semibold text-emerald-600">-₹{safeDiscount.toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 bg-emerald-50 p-3 rounded-lg">
              <span>Total</span>
              <span className="text-emerald-600">₹{safeTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">Payment Method</p>
                <p className="font-semibold text-gray-900 capitalize">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Payment Status</p>
                <p className="font-semibold text-gray-900 capitalize">{order.paymentStatus}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <button
                onClick={() => setShowStatusModal(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                Update Status
              </button>
            )}
            <button
              onClick={handlePrint}
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print Order
            </button>
            <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Update Order Status</h3>
              <button onClick={() => { setShowStatusModal(false); setStatusReason(''); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">Select new status:</p>
              <div className="space-y-2">
                {nextStatuses[order.status as keyof typeof nextStatuses]?.map((status) => {
                  const statusInfo = STATUS_COLORS[status];
                  return (
                    <button
                      key={status}
                      onClick={() => setNewStatus(status)}
                      className={`w-full p-3 text-left rounded-lg border-2 transition-all font-semibold ${
                        newStatus === status
                          ? `${statusInfo.bgColor} ${statusInfo.color} border-emerald-500`
                          : 'border-gray-200 text-gray-900 hover:border-gray-300'
                      }`}
                    >
                      {statusInfo.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Add Note</label>
              <textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="e.g., Shipped via DHL..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowStatusModal(false); setStatusReason(''); }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(newStatus)}
                disabled={updating || !newStatus}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add Internal Note</h3>
              <button onClick={() => setShowNotesModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add an internal note about this order..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowNotesModal(false); setNewNote(''); }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={updating || !newNote.trim()}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
