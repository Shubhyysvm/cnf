import Link from "next/link";
import AnnouncementBar from "@/components/AnnouncementBar";
import Reveal from "@/components/Reveal";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import ProductCard from "@/components/ProductCard";
import CategoryShowcase from "@/components/CategoryShowcase";
import Button from "@/components/Button";
import { API_BASE } from "@/lib/api";
import Hero from "@/components/Hero";
import CountdownBar from "@/components/CountdownBar";
import PressStrip from "@/components/PressStrip";
import Testimonials from "@/components/Testimonials";
import SocialProofNotification from "@/components/SocialProofNotification";
import { LatestArrivals } from "@/components/LatestArrivals";
import { BestSellers } from "@/components/BestSellers";

// Type definitions for API responses
interface Certification {
  id: number;
  name: string;
  issuingBody: string;
  logoUrl: string | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  imageUrl: string | null;
  isFeatured: boolean;
  averageRating: number | null;
  totalReviews: number;
  certifications: Certification[];
  category: Category;
}


async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/products?featured=true`, {
      cache: "no-store", // Always fetch fresh data for featured products
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to fetch featured products:", error);
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export default async function HomePage() {
  // Fetch data in parallel
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen">
      <AnnouncementBar />
      <CountdownBar />

      <Hero />
      <PressStrip />

      {/* Trust Badges Section */}
      <Reveal>
        <section className="bg-white py-12 border-b">
          <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-trust-green mb-2">🌱</div>
              <h3 className="font-semibold text-gray-900">100% Organic</h3>
              <p className="text-sm text-gray-600">Certified pure</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-trust-green mb-2">✓</div>
              <h3 className="font-semibold text-gray-900">Lab Tested</h3>
              <p className="text-sm text-gray-600">Quality assured</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-trust-green mb-2">🚚</div>
              <h3 className="font-semibold text-gray-900">Fast Delivery</h3>
              <p className="text-sm text-gray-600">Fresh to your door</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-trust-green mb-2">♻️</div>
              <h3 className="font-semibold text-gray-900">Sustainable</h3>
              <p className="text-sm text-gray-600">Eco-friendly</p>
            </div>
          </div>
          </Container>
        </section>
      </Reveal>

      {/* Categories Section */}
      {categories.length > 0 && (
        <Reveal>
          <section className="py-16 bg-gradient-to-b from-white to-gray-50">
            <Container>
              <SectionHeading title="Shop by Category" subtitle="Browse our carefully curated selection of organic products" />
              <CategoryShowcase categories={categories} />
            </Container>
          </section>
        </Reveal>
      )}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <Reveal>
          <section className="py-16 bg-white">
            <Container>
            <SectionHeading title="Featured Products" subtitle="Our most popular organic selections" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  slug={p.slug}
                  basePrice={Number(p.basePrice ?? 0)}
                  imageUrl={(p as any).imageUrl}
                  averageRating={p.averageRating as any}
                  totalReviews={p.totalReviews as any}
                  certifications={p.certifications as any}
                />
              ))}
            </div>
            <div className="text-center mt-12">
              <Button href="/products" variant="secondary">View All Products</Button>
            </div>
            </Container>
          </section>
        </Reveal>
      )}

      {/* Dynamic API-driven sections */}
      <Reveal>
        <LatestArrivals />
      </Reveal>
      <Reveal>
        <BestSellers />
      </Reveal>

      {/* Why Choose Us Section */}
      <Reveal>
        <section className="py-16 bg-gradient-to-br from-sprout-green/20 to-trust-green/20">
          <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why CountryNatural?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Authenticity
              </h3>
              <p className="text-gray-600">
                Every product is certified organic with full traceability. We believe in honest, transparent sourcing.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Sustainability
              </h3>
              <p className="text-gray-600">
                Supporting regenerative farming practices and eco-friendly packaging for a healthier planet.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="text-4xl mb-4">💚</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Wellness
              </h3>
              <p className="text-gray-600">
                Nutrient-dense, chemical-free foods that nourish your body and support your health journey.
              </p>
            </div>
          </div>
          </Container>
        </section>
      </Reveal>

      <Testimonials />

      <SocialProofNotification />

      {/* CTA Section */}
      <section className="py-16 bg-trust-green text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Organic Journey?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of families choosing healthier, sustainable living
          </p>
          <Button href="/products" variant="secondary" className="text-lg">Shop Now</Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
