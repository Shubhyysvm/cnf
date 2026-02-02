// @ts-nocheck
"use client";
import { use, useState } from "react";
import Container from "@/components/Container";
import ProductCard from "@/components/ProductCard";
import { API_BASE } from "@/lib/api";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  imageUrl?: string;
  averageRating?: number;
  totalReviews?: number;
  certifications?: any[];
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch data on mount
  useState(() => {
    Promise.all([
      fetch(`${API_BASE}/categories/${slug}`).then(r => r.ok ? r.json() : null),
      fetch(`${API_BASE}/products?category=${slug}`, { cache: "no-store" }).then(r => r.ok ? r.json() : [])
    ]).then(([cat, prods]) => {
      setCategory(cat);
      setProducts(prods);
      setLoading(false);
    });
  });

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.basePrice - b.basePrice;
      case "price-high":
        return b.basePrice - a.basePrice;
      case "name":
        return a.name.localeCompare(b.name);
      case "rating":
        return (b.averageRating || 0) - (a.averageRating || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <main className="pt-28 pb-16">
        <Container>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-trust-green border-t-transparent"></div>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="pt-20 pb-16 bg-gradient-to-b from-gray-50 to-white">
      {/* Category Hero Banner */}
      <div className="relative bg-gradient-to-br from-trust-green via-green-600 to-green-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-white rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        
        <Container>
          <div className="relative py-16 md:py-20">
            {/* Breadcrumb */}
            <div className="mb-6 text-sm text-white/80">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/products" className="hover:text-white transition">Products</Link>
              <span className="mx-2">/</span>
              <span className="text-white font-medium">{category?.name ?? "Category"}</span>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1 max-w-2xl">
                {/* Category Icon/Emoji */}
                <div className="mb-4">
                  <span className="text-6xl drop-shadow-lg">
                    {category?.name.toLowerCase().includes("fruits") && "🍎"}
                    {category?.name.toLowerCase().includes("vegetables") && "🥬"}
                    {category?.name.toLowerCase().includes("grains") && "🌾"}
                    {category?.name.toLowerCase().includes("dairy") && "🥛"}
                    {category?.name.toLowerCase().includes("snacks") && "🍿"}
                    {!/(fruits|vegetables|grains|dairy|snacks)/.test(category?.name?.toLowerCase() || "") && "🌿"}
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                  {category?.name ?? "Category"}
                </h1>
                
                {category?.description && (
                  <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-6 drop-shadow">
                    {category.description}
                  </p>
                )}

                {/* Category Stats */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="font-semibold">{products.length} Products</span>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <span className="font-semibold">100% Organic</span>
                  </div>
                </div>
              </div>

              {/* Category Image */}
              {category?.imageUrl && (
                <div className="hidden lg:block w-64 h-64 relative">
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-3xl transform rotate-6"></div>
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-3xl transform -rotate-3"></div>
                  <div className="relative w-full h-full bg-white/30 backdrop-blur-lg rounded-3xl overflow-hidden shadow-2xl">
                    <img 
                      src={category.imageUrl} 
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Controls Bar */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-green focus:border-transparent bg-white text-sm font-medium"
              >
                <option value="featured">Featured</option>
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition ${
                  viewMode === "grid"
                    ? "bg-white text-trust-green shadow-sm"
                    : "text-gray-600 hover:text-trust-green"
                }`}
                aria-label="Grid view"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition ${
                  viewMode === "list"
                    ? "bg-white text-trust-green shadow-sm"
                    : "text-gray-600 hover:text-trust-green"
                }`}
                aria-label="List view"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* Products Grid/List */}
      <Container>
        <div className="mt-8">
          {sortedProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-600 mb-6">
                We're currently out of stock in this category. Check back soon!
              </p>
              <Link
                href="/products"
                className="inline-block px-6 py-3 bg-trust-green text-white rounded-full font-semibold hover:bg-trust-green/90 transition"
              >
                Browse All Products
              </Link>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                  : "space-y-6"
              }
            >
              {sortedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  slug={p.slug}
                  basePrice={Number(p.basePrice ?? 0)}
                  imageUrl={p.imageUrl}
                  averageRating={p.averageRating}
                  totalReviews={p.totalReviews}
                  certifications={p.certifications}
                />
              ))}
            </div>
          )}
        </div>

        {/* Trust Section */}
        {sortedProducts.length > 0 && (
          <div className="mt-16 bg-gradient-to-r from-trust-green/5 to-green-50 rounded-2xl p-8 border border-trust-green/10">
            <div className="text-center max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Why Choose Our {category?.name}?
              </h3>
              <p className="text-gray-600 mb-6">
                All products are certified organic, sustainably sourced, and carefully selected to meet the highest quality standards.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-trust-green/10 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-trust-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Certified Organic</h4>
                  <p className="text-sm text-gray-600">100% organic certification</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-trust-green/10 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-trust-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Fresh & Fast</h4>
                  <p className="text-sm text-gray-600">Delivered to your door</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-trust-green/10 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-trust-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Eco-Friendly</h4>
                  <p className="text-sm text-gray-600">Sustainable packaging</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
