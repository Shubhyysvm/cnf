import Container from "@/components/Container";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import CategoryChips from "@/components/CategoryChips";
import { API_BASE } from "@/lib/api";

type SearchParams = { search?: string; category?: string };

export const metadata = {
  title: "Products – CountryNatural",
};

async function getProducts(params: SearchParams = {}) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", String(params.search));
  if (params?.category) qs.set("category", String(params.category));
  const res = await fetch(`${API_BASE}/products?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

async function getCategories() {
  const res = await fetch(`${API_BASE}/categories`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  return res.json();
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) || {};
  const [products, categories] = await Promise.all([getProducts(params), getCategories()]);

  return (
    <main className="pt-28 pb-16">
      <Container>
        <SectionHeading title="All Products" subtitle="Wholesome organics for everyday wellness" />
        <form className="mb-8" action="/products" method="get">
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4">
            <input
              name="search"
              defaultValue={(params.search as string) || ""}
              placeholder="Search organic products…"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3"
            />
            <button className="rounded-xl bg-trust-green text-white px-6 font-semibold">Search</button>
          </div>
        </form>

        <div className="mb-8">
          <CategoryChips categories={categories.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug }))} />
        </div>

        {products.length === 0 ? (
          <p className="text-gray-600">No products found. Try a different search.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((p: any) => (
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
        )}
      </Container>
    </main>
  );
}
