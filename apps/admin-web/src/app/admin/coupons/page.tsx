'use client';

import { useState, useEffect } from 'react';
import { adminApiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import type { CouponRecord } from '@countrynaturalfoods/admin-types';
import Link from 'next/link';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchCoupons();
  }, [page]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await adminApiClient.coupons.list(page, pageSize);
      setCoupons(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await adminApiClient.coupons.delete(id);
      setCoupons(coupons.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Failed to delete coupon:', error);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Coupons Management</h1>
        <Link href="/admin/coupons/create">
          <Button className="bg-blue-600 hover:bg-blue-700 flex gap-2">
            <Plus size={20} />
            New Coupon
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : coupons.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Code</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Discount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Valid From</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Valid Until</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Used</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-3 font-mono font-semibold">{coupon.code}</td>
                      <td className="px-6 py-3">
                        {coupon.type === 'percentage' ? (
                          <Badge className="bg-blue-200 text-blue-800">{coupon.value}%</Badge>
                        ) : (
                          <Badge className="bg-green-200 text-green-800">${coupon.value}</Badge>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {coupon.validFrom ? new Date(coupon.validFrom).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {coupon.validTo ? new Date(coupon.validTo).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-3 text-sm">{coupon.usageCount || 0}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/coupons/${coupon.id}`}>
                            <Button size="sm" variant="outline" className="gap-1">
                              <Edit2 size={16} />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteCoupon(coupon.id)}
                            className="gap-1"
                          >
                            <Trash2 size={16} />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="py-2 px-4">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500 py-8">No coupons found.</p>
        )}
      </div>
    </div>
  );
}
