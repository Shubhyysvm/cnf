"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Minus, Plus, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface StickyAddToCartProps {
  productId: string;
  productName: string;
  price: number;
  inStock?: boolean;
}

const weightOptions = [
  { value: "250g", label: "250g", priceMultiplier: 1 },
  { value: "500g", label: "500g", priceMultiplier: 1.8 },
  { value: "1kg", label: "1kg", priceMultiplier: 3.2 },
  { value: "2kg", label: "2kg", priceMultiplier: 5.5 },
];

export default function StickyAddToCart({
  productId,
  productName,
  price,
  inStock = true,
}: StickyAddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState(weightOptions[1].value);
  const { addToCart, isLoading } = useCart();

  const selectedOption = weightOptions.find((opt) => opt.value === selectedWeight);
  const displayPrice = price * (selectedOption?.priceMultiplier || 1);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA when user scrolls down 400px
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToCart = async () => {
    await addToCart(productId, quantity, selectedWeight);
  };

  const incrementQuantity = () => setQuantity((prev) => Math.min(prev + 1, 99));
  const decrementQuantity = () => setQuantity((prev) => Math.max(prev - 1, 1));

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white border-t-2 border-trust-green shadow-2xl transition-transform duration-300 z-40 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
              {productName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-trust-green font-bold text-lg sm:text-xl">
                ₹{displayPrice.toFixed(2)}
              </p>
              {selectedOption && selectedOption.priceMultiplier !== 1 && (
                <span className="text-xs sm:text-sm text-gray-500">
                  (₹{price.toFixed(2)} × {selectedOption.priceMultiplier})
                </span>
              )}
            </div>
          </div>

          {/* Weight Selection */}
          <div className="flex gap-2 flex-wrap">
            {weightOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedWeight(option.value)}
                className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all ${
                  selectedWeight === option.value
                    ? "border-trust-green bg-trust-green/5 text-trust-green"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {selectedWeight === option.value && (
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  )}
                  {option.label}
                </div>
              </button>
            ))}
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quantity Selector */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="p-2 hover:bg-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4 text-gray-700" />
              </button>
              <span className="w-10 text-center font-semibold text-gray-900">
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

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!inStock || isLoading}
              className="flex items-center gap-2 bg-trust-green hover:bg-green-700 text-white font-semibold px-4 sm:px-6 py-3 rounded-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span className="hidden sm:inline">Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
