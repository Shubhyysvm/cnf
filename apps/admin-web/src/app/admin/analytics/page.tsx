'use client';

import { useState, useEffect } from 'react';
import { adminApiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function AnalyticsPage() {
  const [tab, setTab] = useState<'searches' | 'addToCart' | 'abandonments'>('searches');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchData();
  }, [tab, page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let response;
      switch (tab) {
        case 'searches':
          response = await adminApiClient.analytics.listSearchLogs(page, pageSize);
          break;
        case 'addToCart':
          response = await adminApiClient.analytics.listAddToCartEvents(page, pageSize);
          break;
        case 'abandonments':
          response = await adminApiClient.analytics.listCheckoutAbandonments(page, pageSize);
          break;
      }
      setData(response?.data.data || []);
      setTotal(response?.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const renderTable = () => {
    if (tab === 'searches') {
      return (
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Query</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">User ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Results</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: any) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3 text-sm">{item.query}</td>
                <td className="px-6 py-3 font-mono text-sm">{item.userId}</td>
                <td className="px-6 py-3 text-sm">{item.resultCount}</td>
                <td className="px-6 py-3 text-sm text-gray-600">
                  {new Date(item.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (tab === 'addToCart') {
      return (
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Product ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">User ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Quantity</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: any) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3 font-mono text-sm">{item.productId}</td>
                <td className="px-6 py-3 font-mono text-sm">{item.userId}</td>
                <td className="px-6 py-3 text-sm">{item.quantity}</td>
                <td className="px-6 py-3 text-sm text-gray-600">
                  {new Date(item.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return (
      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold">Cart ID</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">User ID</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Total Value</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item: any) => (
            <tr key={item.id} className="border-b hover:bg-gray-50">
              <td className="px-6 py-3 font-mono text-sm">{item.cartId}</td>
              <td className="px-6 py-3 font-mono text-sm">{item.userId}</td>
              <td className="px-6 py-3 font-semibold">
                ${(item.cartValue / 100).toFixed(2)}
              </td>
              <td className="px-6 py-3 text-sm text-gray-600">
                {new Date(item.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <div className="flex gap-2 mb-4">
        <Button
          variant={tab === 'searches' ? 'default' : 'outline'}
          onClick={() => {
            setTab('searches');
            setPage(1);
          }}
        >
          Search Logs
        </Button>
        <Button
          variant={tab === 'addToCart' ? 'default' : 'outline'}
          onClick={() => {
            setTab('addToCart');
            setPage(1);
          }}
        >
          Add to Cart Events
        </Button>
        <Button
          variant={tab === 'abandonments' ? 'default' : 'outline'}
          onClick={() => {
            setTab('abandonments');
            setPage(1);
          }}
        >
          Checkout Abandonments
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : data.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-lg border">{renderTable()}</div>

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
          <p className="text-center text-gray-500 py-8">No data found.</p>
        )}
      </div>
    </div>
  );
}
