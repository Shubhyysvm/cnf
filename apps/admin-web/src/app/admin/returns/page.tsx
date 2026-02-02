'use client';

import { useState, useEffect } from 'react';
import { adminApiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import type { ReturnRecord } from '@countrynaturalfoods/admin-types';

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchReturns();
  }, [page]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await adminApiClient.returns.list(page, pageSize);
      setReturns(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Failed to fetch returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'initiated':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'received':
        return 'bg-cyan-100 text-cyan-800';
      case 'refunded':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Returns Management</h1>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : returns.length > 0 ? (
          <>
            <div className="space-y-3">
              {returns.map((ret) => (
                <div key={ret.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">Item: {ret.orderItemId}</h3>
                        <Badge className={getStatusColor(ret.status)}>{ret.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Reason</p>
                          <p className="text-gray-800">{ret.reason || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Refund Amount</p>
                          <p className="text-gray-800 font-semibold">${(ret.refundAmount || 0) / 100}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(ret.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
          <p className="text-center text-gray-500 py-8">No returns found.</p>
        )}
      </div>
    </div>
  );
}
