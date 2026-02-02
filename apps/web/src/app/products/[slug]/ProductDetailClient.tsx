"use client";

import { useState } from "react";
import Container from "@/components/Container";
import Button from "@/components/Button";
import RatingStars from "@/components/RatingStars";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, Package, Check } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  averageRating?: number;
  totalReviews?: number;
  certifications?: Array<{ id: string; name: string }>;
}

const weightOptions = [
  { value: "250g", label: "250g", priceMultiplier: 1 },
  { value: "500g", label: "500g", priceMultiplier: 1.8, popular: true },
  { value: "1kg", label: "1kg", priceMultiplier: 3.2 },
  { value: "2kg", label: "2kg", priceMultiplier: 5.5 },
];

export default function ProductDetailClient({ product: p }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState(weightOptions[1].value); // Default to 500g
  const { addToCart, isLoading } = useCart();

  const incrementQuantity = () => setQuantity((prev) => Math.min(prev + 1, 99));
  const decrementQuantity = () => setQuantity((prev) => Math.max(prev - 1, 1));

  const selectedOption = weightOptions.find((opt) => opt.value === selectedWeight);
  const displayPrice = Number(p.basePrice ?? 0) * (selectedOption?.priceMultiplier || 1);

  const handleAddToCart = async () => {
    await addToCart(p.id, quantity, selectedWeight);
  };

  return (
    <main className="pt-28 pb-24">
      <Container>
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/products"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-trust-green transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Products
          </Link>
          <div className="text-sm text-gray-500">
            <Link href="/products" className="hover:text-trust-green">
              Products
            </Link>{" "}
            / <span className="text-gray-700">{p.name}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-soft min-h-80 grid place-items-center">
            <span className="text-8xl" aria-hidden>
              {p.name.toLowerCase().includes("kale") && "🥬"}
              {p.name.toLowerCase().includes("quinoa") && "🌾"}
              {p.name.toLowerCase().includes("almond") && "🥜"}
              {p.name.toLowerCase().includes("spinach") && "🥬"}
              {!/(kale|quinoa|almond|spinach)/.test(p.name.toLowerCase()) &&
                "🌿"}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{p.name}</h1>
            <div className="flex items-center gap-3 mb-4">
              {p.averageRating ? <RatingStars value={p.averageRating} /> : null}
              {p.totalReviews ? (
                <span className="text-sm text-gray-600">
                  ({p.totalReviews} reviews)
                </span>
              ) : null}
            </div>
            <div className="text-3xl font-bold text-trust-green mb-6">
              ₹{displayPrice.toFixed(2)}
              {selectedOption && selectedOption.priceMultiplier !== 1 && (
                <span className="text-lg text-gray-500 ml-2">
                  (₹{Number(p.basePrice ?? 0).toFixed(2)} per 250g)
                </span>
              )}
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">{p.description}</p>

            {/* Weight Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-trust-green" />
                Choose Weight
              </label>
              <div className="grid grid-cols-2 gap-3">
                {weightOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedWeight(option.value)}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                      selectedWeight === option.value
                        ? "border-trust-green bg-trust-green/5 shadow-md"
                        : "border-gray-200 hover:border-trust-green/50"
                    }`}
                  >
                    {option.popular && (
                      <span className="absolute -top-2 -right-2 bg-accent-carrot text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-lg text-gray-900">{option.label}</p>
                        <p className="text-sm text-gray-600">
                          ${(Number(p.basePrice ?? 0) * option.priceMultiplier).toFixed(2)}
                        </p>
                      </div>
                      {selectedWeight === option.value && (
                        <div className="w-6 h-6 rounded-full bg-trust-green flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {p.certifications?.length ? (
              <div className="flex flex-wrap gap-2 mb-8">
                {p.certifications.map((c: any) => (
                  <span
                    key={c.id}
                    className="text-xs bg-trust-green/10 text-trust-green px-3 py-1 rounded-full font-medium"
                  >
                    {c.name}
                  </span>
                ))}
              </div>
            ) : null}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="p-2 hover:bg-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4 text-gray-700" />
                </button>
                <span className="w-12 text-center font-semibold text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= 99}
                  className="p-2 hover:bg-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-trust-green hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
              <Button href="/products" variant="secondary">
                Keep Shopping
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
