import Container from "@/components/Container";
import RatingStars from "@/components/RatingStars";
import StickyAddToCart from "@/components/StickyAddToCart";
import { API_BASE } from "@/lib/api";
import Link from "next/link";
import ProductDetailClient from "./ProductDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await fetch(`${API_BASE}/products/${slug}`, { cache: "no-store" });
  if (!res.ok) return { title: "Product – Country Natural Foods" };
  const p = await res.json();
  return {
    title: `${p.name} – Country Natural Foods`,
    description: p.description?.slice(0, 140),
  };
}

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await fetch(`${API_BASE}/products/${slug}`, { cache: "no-store" });
  if (!res.ok)
    return (
      <div className="pt-28">
        <Container>
          <p>Product not found.</p>
        </Container>
      </div>
    );
  const p = await res.json();

  return (
    <>
      <ProductDetailClient product={p} />
      <StickyAddToCart
        productId={p.id}
        productName={p.name}
        price={Number(p.basePrice ?? 0)}
        inStock={true}
      />
    </>
  );
}
