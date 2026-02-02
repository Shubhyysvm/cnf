'use client';

import { useState, useEffect, type DragEvent } from 'react';
import Link from 'next/link';
import { AdminApiClient } from '@countrynaturalfoods/admin-api-client';
import { Category } from '@countrynaturalfoods/admin-types';
import { Plus, Search, Trash2, Edit, GripVertical, FolderOpen, Eye, EyeOff, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    displayOrder: 0,
    isActive: true,
  });
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [orderDirty, setOrderDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const apiClient = new AdminApiClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.categories.getAll();

      // API may return either an array or { data: Category[], ... }
      const payload = Array.isArray(response.data)
        ? response.data
        : Array.isArray((response.data as any)?.data)
          ? (response.data as any).data
          : [];

      const sorted = [...payload]
        .sort((a, b) => (a.sortOrder ?? a.displayOrder ?? 0) - (b.sortOrder ?? b.displayOrder ?? 0))
        .map((c, idx) => ({ ...c, displayOrder: idx }));
      setCategories(sorted);
      setOrderDirty(false);

      // Load presigned thumbnails for categories with images
      const withImages = sorted.filter((c) => !!c.imageUrl);
      const thumbEntries: Array<[string, string]> = [];
      for (const c of withImages) {
        try {
          const presigned = await apiClient.categories.getPresignedImageUrl(c.id);
          if (presigned?.data?.url) {
            thumbEntries.push([c.id, presigned.data.url]);
          }
        } catch (err) {
          // Fallback: leave empty to use direct URL (may be private)
          console.warn('Failed to get presigned URL for category', c.id, err);
        }
      }
      if (thumbEntries.length) {
        setThumbs((prev) => ({ ...prev, ...Object.fromEntries(thumbEntries) }));
      }
    } catch (error) {
      toast.error('Failed to fetch categories');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        icon: category.icon || '',
        displayOrder: category.displayOrder ?? 0,
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        icon: '',
        displayOrder: categories.length,
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      icon: '',
      displayOrder: 0,
      isActive: true,
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (value: string) => {
    setFormData({
      ...formData,
      name: value,
      slug: editingCategory ? formData.slug : generateSlug(value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('Category slug is required');
      return;
    }

    try {
      if (editingCategory) {
        const { displayOrder, ...rest } = formData;
        await apiClient.categories.update(editingCategory.id, {
          ...rest,
          sortOrder: displayOrder,
        });
        toast.success('Category updated successfully');
        setBanner({ type: 'success', message: 'Category updated successfully' });
      } else {
        const { displayOrder, ...rest } = formData;
        await apiClient.categories.create({
          ...rest,
          sortOrder: displayOrder,
        });
        toast.success('Category created successfully');
        setBanner({ type: 'success', message: 'Category created successfully' });
      }
      handleCloseModal();
      fetchCategories();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to save category';
      toast.error(message);
      setBanner({ type: 'error', message });
      console.error(error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

    try {
      await apiClient.categories.delete(id);
      toast.success('Category deleted successfully');
      setBanner({ type: 'success', message: 'Category deleted successfully' });
      fetchCategories();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to delete category';
      toast.error(message);
      setBanner({ type: 'error', message });
      console.error(error);
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      await apiClient.categories.update(category.id, {
        isActive: !category.isActive,
      });
      toast.success(`Category ${!category.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchCategories();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to update category';
      toast.error(message);
      console.error(error);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    cat.slug.toLowerCase().includes(search.toLowerCase())
  );

  const reorderCategories = (fromId: string, toId: string) => {
    setCategories((prev) => {
      const list = [...prev];
      const fromIndex = list.findIndex((c) => c.id === fromId);
      const toIndex = list.findIndex((c) => c.id === toId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);
      return list.map((c, idx) => ({ ...c, displayOrder: idx }));
    });
    setOrderDirty(true);
  };

  const handleDragStart = (id: string) => setDraggingId(id);
  const handleDragOver = (e: DragEvent, overId: string) => {
    e.preventDefault();
    if (!draggingId || draggingId === overId) return;
    reorderCategories(draggingId, overId);
  };
  const handleDragEnd = () => setDraggingId(null);

  const handleSaveOrder = async () => {
    if (!orderDirty) return;
    setSavingOrder(true);
    try {
      await Promise.all(
        categories.map((cat, idx) =>
          apiClient.categories.update(cat.id, { sortOrder: idx })
        )
      );
      toast.success('Category order saved');
      setOrderDirty(false);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to save order';
      toast.error(message);
      console.error(error);
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title Section */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Catalog Organization</p>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Categories</h1>
            <p className="text-slate-600 mt-2 text-base">
              Organize your products into categories for better navigation and discovery.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveOrder}
              disabled={!orderDirty || savingOrder}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 shadow-sm border ${
                orderDirty
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
              }`}
            >
              {savingOrder ? (
                <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <GripVertical size={16} />
              )}
              {savingOrder ? 'Saving...' : orderDirty ? 'Save Order' : 'Order Saved'}
            </button>
            <Link
              href="/admin/categories/create"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-6 py-3 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Plus size={20} />
              Add Category
            </Link>
          </div>
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Categories</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{categories.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderOpen size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {categories.filter((c) => c.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Inactive</p>
              <p className="text-3xl font-bold text-slate-600 mt-1">
                {categories.filter((c) => !c.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <EyeOff size={24} className="text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Banner */}
      {banner && (
        <div
          className={`rounded-lg border p-4 flex items-center justify-between ${
            banner.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {banner.type === 'success' ? <Check size={20} /> : <X size={20} />}
            <span className="font-medium">{banner.message}</span>
          </div>
          <button
            onClick={() => setBanner(null)}
            className="text-slate-500 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search categories by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Icon
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading categories...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-500">
                      <FolderOpen size={48} className="text-slate-300" />
                      <div>
                        <p className="font-medium text-slate-700">No categories found</p>
                        <p className="text-sm">
                          {search ? 'Try adjusting your search terms' : 'Get started by creating your first category'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-slate-50 transition-colors"
                    draggable
                    onDragStart={() => handleDragStart(category.id)}
                    onDragOver={(e) => handleDragOver(e, category.id)}
                    onDragEnd={handleDragEnd}
                    onDrop={handleDragEnd}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <GripVertical size={16} className="text-slate-400 cursor-move" />
                        <span className="text-sm font-medium text-slate-700">{category.displayOrder}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {category.imageUrl ? (
                        <img
                          src={thumbs[category.id] || category.imageUrl}
                          alt={category.name}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-white"
                        />
                      ) : category.icon ? (
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-2xl">
                          {category.icon}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <FolderOpen size={20} className="text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">
                        {category.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(category)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                          category.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {category.isActive ? (
                          <>
                            <Eye size={14} />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff size={14} />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(category.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/categories/${category.id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit category"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(category.id, category.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete category"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity"
              onClick={handleCloseModal}
            ></div>

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white">
                      {editingCategory ? 'Edit Category' : 'Create New Category'}
                    </h3>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="text-white hover:text-blue-100 transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="px-6 py-6 space-y-6">
                  {/* Category Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g., Organic Oils"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="e.g., organic-oils"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      required
                    />
                    <p className="mt-1.5 text-xs text-slate-500">
                      URL-friendly identifier (auto-generated from name)
                    </p>
                  </div>

                  {/* Icon */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Icon (Emoji)
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="e.g., 🌿 or 🥥"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-2xl"
                      maxLength={2}
                    />
                    <p className="mt-1.5 text-xs text-slate-500">
                      Optional emoji to represent this category
                    </p>
                  </div>

                  {/* Display Order */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1.5 text-xs text-slate-500">
                      Lower numbers appear first (0 = highest priority)
                    </p>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-semibold text-slate-700 cursor-pointer">
                      Active (visible to customers)
                    </label>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors shadow-lg hover:shadow-xl"
                  >
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
