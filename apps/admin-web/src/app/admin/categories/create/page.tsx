'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminApiClient } from '@countrynaturalfoods/admin-api-client';
import { ArrowLeft, Check, Loader2, Sparkles, UploadCloud, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateCategoryPage() {
  const router = useRouter();
  const apiClient = useMemo(
    () => new AdminApiClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'),
    []
  );

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate slug when name changes (unless user already edited slug manually)
  useEffect(() => {
    if (form.name && form.slug === '') {
      const generated = form.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setForm((prev) => ({ ...prev, slug: generated }));
    }
  }, [form.name]);

  const handleChange = (key: keyof typeof form, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    if (!form.slug.trim()) {
      toast.error('Slug is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const createRes = await apiClient.categories.create({
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || undefined,
        isActive: form.isActive,
      });

      const categoryId = createRes.data.id;

      if (imageFile && categoryId) {
        try {
          await apiClient.categories.uploadImage(categoryId, imageFile);
        } catch (uploadErr: any) {
          const msg = uploadErr?.response?.data?.message || 'Image upload failed, but category was created.';
          toast.error(msg);
        }
      }
      toast.success('Category created successfully');
      router.push('/admin/categories');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to create category';
      toast.error(message);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Catalog Organization</p>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Create Category</h1>
          <p className="text-slate-600 mt-2 text-base max-w-2xl">
            Add a new category with clear naming, ordering, and an optional managed image to keep navigation tidy.
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/categories')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Categories
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-800">Category Name</label>
                <span className="text-xs text-slate-500">Required</span>
              </div>
              <input
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Organic Oils"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-800">Slug</label>
                <span className="text-xs text-slate-500">Auto-generated, editable</span>
              </div>
              <input
                value={form.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="organic-oils"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
              <p className="text-xs text-slate-500">URL-friendly identifier. Use lowercase and hyphens.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-800">Description</label>
                <span className="text-xs text-slate-500">Optional</span>
              </div>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Short summary that appears in listings or tooltips"
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
              <p className="text-xs text-slate-500">Keep it concise; good for SEO and shopper clarity.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-800">Category Image</label>
                <span className="text-xs text-slate-500">Optional - Uploaded to MinIO</span>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-700 hover:border-blue-400 hover:bg-blue-50 transition flex items-center gap-3">
                  <UploadCloud className="w-5 h-5" />
                  <span className="truncate">{imageFile ? imageFile.name : 'Choose an image file...'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      } else {
                        setImageFile(null);
                        setImagePreview(null);
                      }
                    }}
                  />
                </label>
                {imageFile && (
                  <button
                    type="button"
                    className="p-3 rounded-lg border border-slate-200 hover:bg-red-50 hover:border-red-300 text-slate-600 hover:text-red-600 transition"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    title="Remove selected image"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
              {imagePreview && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Category preview"
                    className="w-full max-w-md h-48 object-contain rounded-lg bg-white border border-slate-200"
                  />
                </div>
              )}
              <p className="text-xs text-slate-500">Upload a category image that will be stored in MinIO and displayed in the storefront.</p>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">Active</p>
                <p className="text-xs text-slate-500">Toggle visibility in the storefront</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-500 transition-all"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-6 shadow"></div>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                {isSubmitting ? 'Saving...' : 'Create Category'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/categories')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Right: Tips */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl shadow-xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.15em] text-emerald-200 font-semibold">Guidance</p>
              <h3 className="text-xl font-bold">Create effective categories</h3>
            </div>
          </div>
          <ul className="space-y-3 text-sm text-slate-100">
            <li className="flex gap-2"><span className="text-emerald-300">•</span> Keep names short and descriptive.</li>
            <li className="flex gap-2"><span className="text-emerald-300">•</span> Use friendly slugs (lowercase, hyphens).</li>
            <li className="flex gap-2"><span className="text-emerald-300">•</span> Prioritize high-traffic categories with lower order values.</li>
            <li className="flex gap-2"><span className="text-emerald-300">•</span> Upload or link an image for visual clarity.</li>
            <li className="flex gap-2"><span className="text-emerald-300">•</span> You can toggle visibility anytime.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
