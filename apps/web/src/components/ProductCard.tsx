"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import RatingStars from "./RatingStars";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export type ProductCardData = {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  imageUrl?: string | null;
  averageRating?: number | null;
  totalReviews?: number | null;
  certifications?: { id: string | number; name: string }[];
};

export default function ProductCard({
  id,
  name,
  slug,
  basePrice,
  imageUrl,
  averageRating,
  totalReviews,
  certifications = [],
}: ProductCardData) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart, isLoading } = useCart();
  const { addToWishlist, removeFromWishlist, checkWishlist } = useWishlist();

  useEffect(() => {
    // Check if product is already in wishlist
    checkWishlist(String(id)).then(setIsWishlisted);
  }, [id, checkWishlist]);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isWishlisted) {
      await removeFromWishlist(String(id));
      setIsWishlisted(false);
    } else {
      await addToWishlist(String(id));
      setIsWishlisted(true);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(String(id), 1);
  };

  return (
    <div className="group relative">
      <Link
        key={id}
        href={`/products/${slug}`}
        className="block bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-trust-green/30 transform hover:-translate-y-2"
        aria-label={`View ${name}`}
      >
        {/* Image container with zoom effect */}
        <div className="relative h-56 bg-gradient-to-br from-sprout-green/30 to-trust-green/30 overflow-hidden">
          <div className="absolute inset-0 grid place-items-center transition-transform duration-500 group-hover:scale-110">
            <span className="text-7xl drop-shadow-lg" aria-hidden>
              {name.toLowerCase().includes("kale") && "🥬"}
              {name.toLowerCase().includes("quinoa") && "🌾"}
              {name.toLowerCase().includes("almond") && "🥜"}
              {name.toLowerCase().includes("spinach") && "🥬"}
              {!/(kale|quinoa|almond|spinach)/.test(name.toLowerCase()) && "🌿"}
            </span>
          </div>
          
          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Quick view button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="bg-white text-trust-green px-6 py-2 rounded-full font-semibold text-sm shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
              Quick View
            </span>
          </div>

          {/* Badge for featured/new */}
          <div className="absolute top-3 left-3">
            <span className="bg-accent-carrot text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
              Popular
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-trust-green transition-colors">
              {name}
            </h3>
            <div className="text-right">
              <span className="text-2xl font-bold text-trust-green">
                ₹{basePrice.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500 line-through">
                ${(basePrice * 1.3).toFixed(2)}
              </span>
            </div>
          </div>

          {typeof averageRating === "number" && averageRating > 0 ? (
            <div className="flex items-center gap-2 mb-3">
              <RatingStars value={averageRating} size="sm" />
              <span className="text-xs text-gray-600 font-medium">({totalReviews ?? 0} reviews)</span>
            </div>
          ) : null}

          {certifications.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {certifications.map((c) => (
                <span 
                  key={c.id} 
                  className="text-[11px] bg-trust-green/10 text-trust-green px-2.5 py-1 rounded-full font-semibold border border-trust-green/20 hover:bg-trust-green/20 transition"
                >
                  ✓ {c.name}
                </span>
              ))}
            </div>
          ) : null}

          {/* Add to cart CTA */}
          <button 
            onClick={handleAddToCart}
            disabled={isLoading}
            className="w-full mt-3 bg-trust-green/5 text-trust-green py-2.5 rounded-xl font-semibold text-sm hover:bg-trust-green hover:text-white transition-all duration-300 border border-trust-green/20 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Adding...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </Link>

      {/* Wishlist heart button */}
      <button
        onClick={handleWishlist}
        className="absolute top-5 right-5 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center group/heart"
        aria-label="Add to wishlist"
      >
        <svg 
          className={`w-5 h-5 transition-all ${
            isWishlisted 
              ? 'fill-red-500 text-red-500 scale-110' 
              : 'fill-none text-gray-600 group-hover/heart:text-red-500'
          }`}
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    </div>
  );
}
