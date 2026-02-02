"use client";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { ShoppingBag, Trash2, X, Package } from "lucide-react";

export default function MiniCart() {
  const { cart, isCartOpen, closeCart, updateQuantity, removeItem, isLoading } = useCart();

  if (!isCartOpen) return null;

  const freeShippingThreshold = 4000;
  const progressToFreeShipping = Math.min((cart.subtotal / freeShippingThreshold) * 100, 100);
  const amountForFreeShipping = Math.max(0, freeShippingThreshold - cart.subtotal);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-left">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-trust-green to-green-700 text-white p-6">
          <button
            onClick={closeCart}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition backdrop-blur-sm"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Shopping Cart</h2>
              <p className="text-white/80 text-sm">
                {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>

          {/* Free shipping progress */}
          {cart.subtotal > 0 && cart.subtotal < freeShippingThreshold && (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="flex items-center gap-1.5">
                  <Package className="w-4 h-4" />
                  Free Shipping
                </span>
                <span className="font-semibold">
                  ₹{amountForFreeShipping.toFixed(2)} away
                </span>
              </div>
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-white to-white/80 transition-all duration-500 ease-out"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>
          )}

          {cart.subtotal >= freeShippingThreshold && (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2 text-sm">
              <Package className="w-4 h-4" />
              <span className="font-semibold">You qualified for FREE shipping! 🎉</span>
            </div>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-trust-green/10 to-sprout-green/10 flex items-center justify-center mb-6">
                <ShoppingBag className="w-16 h-16 text-trust-green/40" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6 max-w-xs">
                Start adding some organic goodness to your cart!
              </p>
              <button
                onClick={closeCart}
                className="inline-flex items-center gap-2 px-6 py-3 bg-trust-green text-white rounded-lg font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-trust-green/30 transition-all duration-200"
                >
                  {/* Product Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 bg-gradient-to-br from-sprout-green/20 to-trust-green/20 rounded-lg flex items-center justify-center overflow-hidden">
                    <span className="text-3xl">{
                      item.productName.toLowerCase().includes("kale") ? "🥬" :
                      item.productName.toLowerCase().includes("quinoa") ? "🌾" :
                      item.productName.toLowerCase().includes("almond") ? "🥜" :
                      item.productName.toLowerCase().includes("spinach") ? "🥬" :
                      "🌿"
                    }</span>
                    {/* Quick remove on hover */}
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={isLoading}
                      className="absolute inset-0 bg-red-500/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center disabled:opacity-50"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.productSlug}`}
                      className="font-semibold text-gray-900 hover:text-trust-green transition block truncate text-sm leading-tight"
                      onClick={closeCart}
                    >
                      {item.productName}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-500">
                        ₹{item.price.toFixed(2)} each
                      </p>
                      {item.variant && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-trust-green/10 text-trust-green border border-trust-green/20">
                          {item.variant}
                        </span>
                      )}
                    </div>
                    
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={isLoading || item.quantity <= 1}
                          className="px-2.5 py-1 hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed text-sm font-semibold"
                        >
                          −
                        </button>
                        <span className="px-3 py-1 bg-gray-50 font-bold text-sm min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={isLoading}
                          className="px-2.5 py-1 hover:bg-gray-50 transition disabled:opacity-50 text-sm font-semibold"
                        >
                          +
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-red-600 text-xs font-medium disabled:opacity-50 transition-colors ml-auto"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  {/* Item Total */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-base text-trust-green">
                      ₹{item.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with totals and checkout */}
        {cart.items.length > 0 && (
          <div className="border-t bg-gradient-to-b from-gray-50 to-white p-5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            {/* Subtotal */}
            <div className="flex justify-between items-baseline mb-6">
              <div>
                <span className="text-sm text-gray-600">Subtotal</span>
                <p className="text-xs text-gray-500 mt-0.5">Taxes calculated at checkout</p>
              </div>
              <span className="text-3xl font-bold text-trust-green">
                ₹{cart.subtotal.toFixed(2)}
              </span>
            </div>

            {/* View Cart Button */}
            <Link
              href="/cart"
              onClick={closeCart}
              className="block w-full bg-white border-2 border-trust-green text-trust-green text-center py-4 rounded-xl font-bold text-base hover:bg-trust-green hover:text-white transition-all shadow-md hover:shadow-lg mb-3"
            >
              View Cart
            </Link>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-gradient-to-r from-trust-green to-green-600 text-white text-center py-4 rounded-xl font-bold text-base hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] mb-3"
            >
              Checkout →
            </Link>

            {/* Continue Shopping */}
            <button
              onClick={closeCart}
              className="block w-full text-trust-green text-center py-3 rounded-xl font-semibold hover:bg-trust-green/5 transition-colors border border-trust-green/20"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
