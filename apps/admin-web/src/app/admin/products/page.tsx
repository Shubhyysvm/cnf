'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminApiClient } from '@countrynaturalfoods/admin-api-client';
import { Product } from '@countrynaturalfoods/admin-types';
import { Plus, Search, Trash2, Edit, Check, X, ChevronDown, ChevronUp, Package, Tags, Grid3X3, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface CategoryColor {
  bg: string;
  border: string;
  header: string;
  badge: string;
  icon: string;
  hover: string;
}

interface CategoryGroup {
  categoryId: string;
  categoryName: string;
  productCount: number;
  totalVariants: number;
  products: Product[];
  isExpanded: boolean;
  color: CategoryColor;
}

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const apiClient = new AdminApiClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');
  // Color palette for categories
  const colors: CategoryColor[] = [
    { bg: 'bg-blue-50', border: 'border-blue-200', header: 'bg-blue-100', badge: 'bg-blue-100 text-blue-700', icon: 'text-blue-600', hover: 'hover:bg-blue-50' },
    { bg: 'bg-emerald-50', border: 'border-emerald-200', header: 'bg-emerald-100', badge: 'bg-emerald-100 text-emerald-700', icon: 'text-emerald-600', hover: 'hover:bg-emerald-50' },
    { bg: 'bg-amber-50', border: 'border-amber-200', header: 'bg-amber-100', badge: 'bg-amber-100 text-amber-700', icon: 'text-amber-600', hover: 'hover:bg-amber-50' },
    { bg: 'bg-rose-50', border: 'border-rose-200', header: 'bg-rose-100', badge: 'bg-rose-100 text-rose-700', icon: 'text-rose-600', hover: 'hover:bg-rose-50' },
    { bg: 'bg-violet-50', border: 'border-violet-200', header: 'bg-violet-100', badge: 'bg-violet-100 text-violet-700', icon: 'text-violet-600', hover: 'hover:bg-violet-50' },
    { bg: 'bg-cyan-50', border: 'border-cyan-200', header: 'bg-cyan-100', badge: 'bg-cyan-100 text-cyan-700', icon: 'text-cyan-600', hover: 'hover:bg-cyan-50' },
  ];


  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.products.getAll({
        page: 1,
        pageSize: 500,
        search: search || undefined,
      });
        // Debug: Log raw product data
        console.log('Raw products:', response.data.data.slice(0, 2));

      
      // Deduplicate by ID
      const seen = new Set<string>();
      const unique = response.data.data.filter((p) => {
        if (seen.has(p.id)) {
          return false;
        }
        seen.add(p.id);
        return true;
      });
      
      setAllProducts(unique);
      groupProductsByCategory(unique);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupProductsByCategory = (products: Product[]) => {
    // Try multiple category field names
    const grouped = new Map<string, { categoryName: string; products: Product[] }>();
    
    products.forEach((product) => {
      // Try to get category name from various possible fields
      const categoryName = 
        (product as any)?.categoryName?.trim() ||
        (product as any)?.category?.name?.trim() ||
        'Uncategorized';
      
      const categoryId = (product as any)?.categoryId || categoryName;

      console.log(`Product: ${product.name}, Category: ${categoryName}, CategoryId: ${categoryId}`);

      if (!grouped.has(categoryId)) {
        grouped.set(categoryId, { categoryName, products: [] });
      }
      grouped.get(categoryId)!.products.push(product);
    });

    // Convert to array with colors
    const groups: CategoryGroup[] = Array.from(grouped.entries()).map(([catId, data], index) => {
      const totalVariants = data.products.reduce((sum, p) => sum + ((p as any).variantCount || p.variants?.length || 0), 0);
      return {
        categoryId: catId,
        categoryName: data.categoryName,
        productCount: data.products.length,
        totalVariants,
        products: data.products.sort((a, b) => a.name.localeCompare(b.name)),
        isExpanded: true,
        color: colors[index % colors.length],
      };
    });

    // Sort groups alphabetically
    groups.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
    setCategoryGroups(groups);
  };

  const toggleCategory = (categoryId: string) => {
    setCategoryGroups((groups) =>
      groups.map((g) =>
        g.categoryId === categoryId
          ? { ...g, isExpanded: !g.isExpanded }
          : g
      )
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await apiClient.products.delete(id);
      toast.success('Product deleted successfully');
      setBanner({ type: 'success', message: 'Product deleted successfully' });
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
      setBanner({ type: 'error', message: 'Failed to delete product' });
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-10 bg-slate-50 pb-6 space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider mb-2">Catalog Management</p>
              <h1 className="text-4xl font-bold tracking-tight">Products</h1>
              <p className="text-blue-100 mt-3 text-base">Organize and manage your complete product catalog by category</p>
            </div>
            <Link
              href="/admin/products/create"
              className="inline-flex items-center gap-2 rounded-lg bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Add Product
            </Link>
          </div>
        </div>

        {/* Summary Stats */}
        {!isLoading && allProducts.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 p-6">
              <Package size={24} className="text-blue-600 mb-3" />
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Total Products</p>
              <p className="text-3xl font-bold text-blue-900">{allProducts.length}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-200 p-6">
              <Tags size={24} className="text-emerald-600 mb-3" />
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Categories</p>
              <p className="text-3xl font-bold text-emerald-900">{categoryGroups.length}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200 p-6">
              <TrendingUp size={24} className="text-amber-600 mb-3" />
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Total Variants</p>
              <p className="text-3xl font-bold text-amber-900">
                {categoryGroups.reduce((sum, g) => sum + g.totalVariants, 0)}
              </p>
            </div>
          </div>
        )}

        {/* Success/Error Banner */}
        {banner && (
          <div
            className={`rounded-lg border p-4 flex items-center justify-between ${
              banner.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            <span className="font-medium text-sm">{banner.message}</span>
            <button
              onClick={() => setBanner(null)}
              className="text-sm opacity-70 hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="flex items-center gap-3 bg-white rounded-lg border-2 border-slate-200 px-5 py-3.5 shadow-sm hover:border-blue-300 focus-within:border-blue-500 transition-colors">
          <Search size={20} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-slate-900 placeholder-slate-500 text-sm"
          />
          <span className="text-xs font-semibold text-slate-500 px-3 py-1 bg-slate-50 rounded">
            {allProducts.length} total
          </span>
        </div>
      </div>

      {/* Categories & Products */}
      <div className="space-y-5">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="h-20 w-full animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        ) : categoryGroups.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-16 text-center">
            <Package size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-lg font-semibold text-slate-700">No products found</p>
            <p className="text-slate-500 mt-1 text-sm">Try adjusting your search or create a new product.</p>
          </div>
        ) : (
          categoryGroups.map((group) => (
            <div
              key={group.categoryId}
              className={`rounded-xl border-2 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-white ${group.color.border}`}
            >
              {/* Category Header with Stats */}
              <button
                onClick={() => toggleCategory(group.categoryId)}
                className={`w-full flex items-center justify-between px-7 py-5 transition-all duration-200 ${group.color.header}`}
              >
                <div className="flex items-center gap-5 flex-1">
                  <div className={`p-3 rounded-lg ${group.color.bg} border-2 ${group.color.border}`}>
                    <Grid3X3 size={22} className={group.color.icon} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-900 text-xl">{group.categoryName}</h3>
                    <div className="flex gap-4 mt-1">
                      <span className="text-sm font-medium text-slate-700">
                        📦 {group.productCount} Product{group.productCount !== 1 ? 's' : ''}
                      </span>
                      <span className="text-sm font-medium text-slate-700">
                        🎯 {group.totalVariants} Variant{group.totalVariants !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${group.color.badge}`}>
                    {group.products.length}
                  </span>
                  {group.isExpanded ? (
                    <ChevronUp size={22} className="text-slate-600 font-bold" />
                  ) : (
                    <ChevronDown size={22} className="text-slate-600 font-bold" />
                  )}
                </div>
              </button>

              {/* Category Products */}
              {group.isExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${group.color.header} border-t-2 ${group.color.border}`}>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Product Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">SKU</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Variants</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {group.products.map((product) => {
                        const variantCount = (product as any).variantCount ?? product.variants?.length ?? 0;
                        return (
                          <tr
                            key={product.id}
                            className={`transition-colors duration-150 border-b ${group.color.bg} ${group.color.hover}`}
                          >
                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-900 text-sm">{product.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{product.shortDescription || 'No description'}</p>
                            </td>
                            <td className="px-6 py-4">
                              <code className="bg-slate-100 px-2.5 py-1 rounded text-xs font-mono text-slate-700">
                                {product.sku || '—'}
                              </code>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-900 text-sm">₹{Number(product.price ?? 0).toFixed(2)}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 rounded-full ${group.color.badge} px-2.5 py-1 text-xs font-medium`}>
                                {variantCount} {variantCount !== 1 ? 'variants' : 'variant'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5">
                                {product.isActive ? (
                                  <>
                                    <Check size={14} className="text-green-600" />
                                    <span className="text-xs font-medium text-green-700">Active</span>
                                  </>
                                ) : (
                                  <>
                                    <X size={14} className="text-slate-400" />
                                    <span className="text-xs font-medium text-slate-500">Inactive</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Link
                                  href={`/admin/products/${product.id}/edit`}
                                  className="inline-flex items-center gap-1 rounded px-3 py-1.5 text-blue-600 hover:bg-blue-50 transition-colors duration-200 font-medium text-xs"
                                  title="Edit product"
                                >
                                  <Edit size={14} />
                                  Edit
                                </Link>
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="inline-flex items-center gap-1 rounded px-3 py-1.5 text-red-600 hover:bg-red-50 transition-colors duration-200 font-medium text-xs"
                                  title="Delete product"
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
