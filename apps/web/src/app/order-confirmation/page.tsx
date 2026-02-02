"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Container from "@/components/Container";
import Link from "next/link";
import { CheckCircle, Package, Truck, Mail, ArrowRight } from "lucide-react";

function ClientOrderConfirmation() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`http://localhost:3001/orders/${orderNumber}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="pt-28 pb-16">
        <Container>
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-16 h-16 border-4 border-trust-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </Container>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="pt-28 pb-16">
        <Container>
          <div className="max-w-2xl mx-auto text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order not found</h1>
            <p className="text-gray-600 mb-8">We couldn't find this order.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-trust-green text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="pt-28 pb-16 bg-gray-50">
      <Container>
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-trust-green to-green-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Order Confirmed! 🎉
            </h1>
            <p className="text-lg text-gray-600">
              Thank you for your order, {order.customerFirstName}!
            </p>
          </div>

          {/* Order Number Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-trust-green/20 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                <p className="text-2xl font-bold text-trust-green">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Order Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
              <div className="w-12 h-12 rounded-full bg-trust-green/10 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-trust-green" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Confirmation Email</h3>
              <p className="text-sm text-gray-600">Sent to {order.customerEmail}</p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Processing</h3>
              <p className="text-sm text-gray-600">We're preparing your order</p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Estimated Delivery</h3>
              <p className="text-sm text-gray-600">3-5 business days</p>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Details</h2>

            <div className="space-y-3 mb-6 pb-6 border-b">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-sprout-green/20 to-trust-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🌿</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-trust-green">₹{Number(item.total).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₹{Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">
                  {Number(order.shippingCost) === 0 ? (
                    <span className="text-trust-green">FREE</span>
                  ) : (
                    `₹${Number(order.shippingCost).toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold">₹{Number(order.tax).toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-trust-green">
                  ₹{Number(order.total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
            <div className="text-gray-700 space-y-1">
              <p className="font-semibold">
                {order.customerFirstName} {order.customerLastName}
              </p>
              <p>{order.shippingAddress}</p>
              {order.shippingApartment && <p>{order.shippingApartment}</p>}
              <p>
                {order.shippingCity}, {order.shippingState} {order.shippingZip}
              </p>
              <p>{order.shippingCountry}</p>
              <p className="pt-2">{order.customerPhone}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-trust-green text-trust-green rounded-xl font-semibold hover:bg-trust-green hover:text-white transition-all shadow-md hover:shadow-lg"
            >
              Go to Home
            </Link>
            <Link
              href="/products"
              className="flex items-center justify-center gap-2 px-6 py-4 bg-trust-green text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
            >
              Continue Shopping
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <main className="pt-28 pb-16">
          <Container>
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="w-16 h-16 border-4 border-trust-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading order details...</p>
            </div>
          </Container>
        </main>
      }
    >
      <ClientOrderConfirmation />
    </Suspense>
  );
}
