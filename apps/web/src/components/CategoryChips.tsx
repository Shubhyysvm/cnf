import Link from "next/link";

type Category = { id: number | string; name: string; slug: string };

export default function CategoryChips({ categories }: { categories: Category[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/categories/${c.slug}`}
          className="px-4 py-2 rounded-full bg-white text-gray-700 border border-gray-200 hover:border-trust-green hover:text-trust-green transition text-sm"
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
