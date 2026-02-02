'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import type { ReviewRecord } from '@countrynaturalfoods/admin-types';

export default function ReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | ''>('');
  const pageSize = 20;

  useEffect(() => {
    fetchReviews();
  }, [page, status]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await adminApiClient.reviews.list(page, pageSize, status || undefined);
      setReviews(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (id: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      await adminApiClient.reviews.updateStatus(id, newStatus);
      setReviews(reviews.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    } catch (error) {
      console.error('Failed to update review:', error);
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reviews Management</h1>
        <div className="flex gap-2">
          {['', 'pending', 'approved', 'rejected'].map((s) => (
            <Button
              key={s}
              variant={status === s ? 'default' : 'outline'}
              onClick={() => {
                setStatus(s as any);
                setPage(1);
              }}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : reviews.length > 0 ? (
          <>
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{review.title || 'No Title'}</h3>
                        <Badge className={getStatusColor(review.status)}>{review.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Product: {review.productId}</p>
                      <p className="text-sm text-gray-600 mb-2">User: {review.userId}</p>
                      <p className="text-gray-700 mb-2">Rating: {review.rating}/5 ⭐</p>
                      <p className="text-gray-800">{review.comment}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(review.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {review.status !== 'approved' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => updateReviewStatus(review.id, 'approved')}
                      >
                        Approve
                      </Button>
                    )}
                    {review.status !== 'rejected' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateReviewStatus(review.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    )}
                    {review.status !== 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateReviewStatus(review.id, 'pending')}
                      >
                        Pending
                      </Button>
                    )}
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
          <p className="text-center text-gray-500 py-8">No reviews found.</p>
        )}
      </div>
    </div>
  );
}
