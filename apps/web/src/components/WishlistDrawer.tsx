// @ts-nocheck
"use client";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

export default function WishlistDrawer() {
  const { wishlist, isWishlistOpen, closeWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  const handleAddToCart = async (item: any) => {
    setLoadingItems((prev) => new Set(prev).add(item.id));
    try {
      await addToCart(item.productId, 1, item.variantId);
      toast.success("Added to Cart!", { duration: 2000 });
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setLoadingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  if (!isWishlistOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition backdrop-blur-sm"
        onClick={closeWishlist}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-md z-50 bg-white shadow-2xl flex flex-col transform transition ease-in-out duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Wishlist</h2>
            <p className="text-sm text-gray-600 mt-1">
              {wishlist.itemCount} {wishlist.itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            onClick={closeWishlist}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="Close wishlist"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {wishlist.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg
                className="w-16 h-16 text-gray-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Your wishlist is empty</h3>
              <p className="text-gray-600 mt-2">
                Start adding your favorite items to save them for later
              </p>
              <Link
                href="/products"
                onClick={closeWishlist}
                className="mt-6 inline-block px-6 py-2 bg-trust-green text-white rounded-full font-semibold hover:bg-trust-green/90 transition"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            wishlist.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200"
              >
                {/* Product Info */}
                <div className="flex-1">
                  <Link
                    href={`/products/${item.productSlug}`}
                    onClick={closeWishlist}
                    className="block"
                  >
                    <h3 className="font-semibold text-gray-900 hover:text-trust-green transition">
                      {item.productName}
                    </h3>
                  </Link>
                  {item.variant && (
                    <p className="text-sm text-gray-600 mt-1">{item.variant}</p>
                  )}
                  <p className="text-lg font-bold text-trust-green mt-2">
                    ₹{item.price.toFixed(2)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={loadingItems.has(item.id)}
                    className="px-3 py-2 bg-trust-green text-white rounded-lg text-sm font-semibold hover:bg-trust-green/90 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {loadingItems.has(item.id) ? "Adding..." : "Add"}
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.productId, item.variantId)}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition whitespace-nowrap"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {wishlist.items.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-3">
            <Link
              href="/products"
              onClick={closeWishlist}
              className="w-full block text-center px-4 py-3 bg-trust-green text-white rounded-lg font-semibold hover:bg-trust-green/90 transition"
            >
              Continue Shopping
            </Link>
            <button
              onClick={closeWishlist}
              className="w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </>
  );
}
