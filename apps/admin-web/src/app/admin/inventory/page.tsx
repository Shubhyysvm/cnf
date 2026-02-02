'use client';

import { useState, useEffect } from 'react';
import { adminApiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export default function InventoryPage() {
  const [movements, setMovements] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'movements' | 'reservations'>('movements');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [variantFilter, setVariantFilter] = useState('');
  const pageSize = 20;

  useEffect(() => {
    fetchData();
  }, [page, tab, variantFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (tab === 'movements') {
        const response = await adminApiClient.inventory.listMovements(page, pageSize, variantFilter || undefined);
        setMovements(response.data.data);
        setTotal(response.data.total);
      } else {
        const response = await adminApiClient.inventory.listReservations(page, pageSize, variantFilter || undefined);
        setReservations(response.data.data);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);
  const data = tab === 'movements' ? movements : reservations;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Inventory Management</h1>

      <div className="flex gap-2 mb-4">
        <Button
          variant={tab === 'movements' ? 'default' : 'outline'}
          onClick={() => {
            setTab('movements');
            setPage(1);
          }}
        >
          Movements
        </Button>
        <Button
          variant={tab === 'reservations' ? 'default' : 'outline'}
          onClick={() => {
            setTab('reservations');
            setPage(1);
          }}
        >
          Reservations
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Filter by variant ID..."
          value={variantFilter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setVariantFilter(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : data.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Variant ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      {tab === 'movements' ? 'Movement Type' : 'Quantity'}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      {tab === 'movements' ? 'Quantity' : 'Order ID'}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      {tab === 'movements' ? 'Notes' : 'Status'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item: any) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-3 font-mono text-sm">{item.variantId}</td>
                      <td className="px-6 py-3 text-sm capitalize">
                        {tab === 'movements' ? item.movementType : item.quantity}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {tab === 'movements' ? item.quantity : item.orderId}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {tab === 'movements' ? item.notes || '-' : item.status || '-'}
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
          <p className="text-center text-gray-500 py-8">No data found.</p>
        )}
      </div>
    </div>
  );
}
