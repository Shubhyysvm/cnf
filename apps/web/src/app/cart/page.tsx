"use client";

import { useCart } from "@/context/CartContext";
import Container from "@/components/Container";
import Link from "next/link";
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, Package } from "lucide-react";

export default function CartPage() {
  const { cart, updateQuantity, removeItem, isLoading } = useCart();

  const freeShippingThreshold = 4000;
  const progressToFreeShipping = Math.min((cart.subtotal / freeShippingThreshold) * 100, 100);
  const amountForFreeShipping = Math.max(0, freeShippingThreshold - cart.subtotal);
  const shippingCost = cart.subtotal >= freeShippingThreshold ? 0 : 500;
  const tax = cart.subtotal * 0.08;
  const total = cart.subtotal + shippingCost + tax;

  if (cart.items.length === 0) {
    return (
      <main className="pt-28 pb-16">
        <Container>
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-trust-green/10 to-sprout-green/10 flex items-center justify-center mx-auto mb-8">
              <ShoppingBag className="w-16 h-16 text-trust-green/40" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Start shopping to add some organic goodness!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-trust-green text-white rounded-lg font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Browse Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="pt-28 pb-16 bg-gray-50">
      <Container>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <Link
              href="/products"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-trust-green transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Continue Shopping
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free Shipping Progress */}
              {cart.subtotal > 0 && cart.subtotal < freeShippingThreshold && (
                <div className="bg-gradient-to-br from-trust-green to-green-700 text-white rounded-xl p-5 shadow-lg">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="flex items-center gap-2 font-semibold">
                      <Package className="w-5 h-5" />
                      Free Shipping on orders over ₹{freeShippingThreshold}
                    </span>
                    <span className="font-bold">
                      ₹{amountForFreeShipping.toFixed(2)} away
                    </span>
                  </div>
                  <div className="h-3 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-500 ease-out"
                      style={{ width: `${progressToFreeShipping}%` }}
                    />
                  </div>
                </div>
              )}

              {cart.subtotal >= freeShippingThreshold && (
                <div className="bg-gradient-to-br from-trust-green to-green-700 text-white rounded-xl p-5 flex items-center gap-3 shadow-lg">
                  <Package className="w-6 h-6" />
                  <span className="font-bold text-lg">You qualified for FREE shipping! 🎉</span>
                </div>
              )}

              {/* Cart Items List */}
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-sprout-green/20 to-trust-green/20 rounded-lg flex items-center justify-center">
                      <span className="text-4xl">
                        {item.productName.toLowerCase().includes("kale") ? "🥬" :
                         item.productName.toLowerCase().includes("quinoa") ? "🌾" :
                         item.productName.toLowerCase().includes("almond") ? "🥜" :
                         item.productName.toLowerCase().includes("spinach") ? "🥬" :
                         "🌿"}
                      </span>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Link
                            href={`/products/${item.productSlug}`}
                            className="font-semibold text-lg text-gray-900 hover:text-trust-green transition"
                          >
                            {item.productName}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-gray-600">
                              ₹{item.price.toFixed(2)} each
                            </p>
                            {item.variant && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-trust-green/10 text-trust-green border border-trust-green/20">
                                {item.variant}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={isLoading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3 border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={isLoading || item.quantity <= 1}
                            className="p-2 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="w-12 text-center font-semibold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={isLoading}
                            className="p-2 hover:bg-gray-50 disabled:opacity-50 transition"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-500">Item Total</p>
                          <p className="text-xl font-bold text-trust-green">
                            ₹{item.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.itemCount} items)</span>
                    <span className="font-semibold">₹{cart.subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-semibold">
                      {shippingCost === 0 ? (
                        <span className="text-trust-green">FREE</span>
                      ) : (
                        `₹${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Tax</span>
                    <span className="font-semibold">₹{tax.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-trust-green">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 bg-trust-green text-white font-semibold px-6 py-4 rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  href="/products"
                  className="block text-center text-trust-green font-medium mt-4 hover:underline"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
