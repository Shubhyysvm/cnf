"use client";
import React, { useEffect, useState } from "react";
import Container from "./Container";
import SectionHeading from "./SectionHeading";
import ProductCard from "./ProductCard";
import { API_BASE } from "@/lib/api";

type Product = {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  imageUrl: string | null;
  averageRating?: number | null;
  totalReviews?: number;
};

export function LatestArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/products?new=true&limit=8`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed with ${res.status}`);
        const data = await res.json();
        if (isMounted) setProducts(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (isMounted) setError(e?.message || "Failed to load");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    run();
    return () => { isMounted = false; };
  }, []);

  return (
    <section className="py-16 bg-white">
      <Container>
        <SectionHeading title="Latest Arrivals" subtitle="Freshly added organic products" />
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse h-64 bg-gray-100 rounded" />
            ))}
          </div>
        )}
        {!loading && error && (
          <p className="text-red-600">{error}</p>
        )}
        {!loading && !error && products.length === 0 && (
          <p className="text-gray-600">No new arrivals at the moment.</p>
        )}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                slug={p.slug}
                basePrice={Number(p.basePrice ?? 0)}
                imageUrl={p.imageUrl ?? undefined}
                averageRating={p.averageRating as any}
                totalReviews={p.totalReviews as any}
                certifications={[]}
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
