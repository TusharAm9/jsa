'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface WorkOrder {
  id: number;
  caustomerName: string;
  PhoneNumber: number;
  BuildingId: string;
  Date: string;
  ServiceType: 'FullValue' | 'UBR' | 'P2';
  PaymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'FAILED':
      return 'bg-red-100 text-red-800';
    case 'PENDING':
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

const getServiceTypeColor = (type: string) => {
  switch (type) {
    case 'FullValue':
      return 'bg-blue-100 text-blue-800';
    case 'UBR':
      return 'bg-purple-100 text-purple-800';
    case 'P2':
      return 'bg-indigo-100 text-indigo-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function WorkPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const response = await fetch('/api/work');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch work orders');
        }

        setWorkOrders(data.workOrders || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkOrders();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Work Orders</h1>
            <p className="text-gray-300">Manage your work orders and track their status</p>
          </div>
          <Link href="/work/create-work">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              + Create Work Order
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d457f]"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading...</p>
             </div>
         
        ) : workOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">No work orders yet</p>
            <p className="text-gray-500 mb-6">Create your first work order to get started</p>
            <Link href="/work/create-work">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                Create First Work Order
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Customer Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Building ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Service Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Payment Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {workOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {order.caustomerName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {order.BuildingId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {order.PhoneNumber}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getServiceTypeColor(
                            order.ServiceType
                          )}`}
                        >
                          {order.ServiceType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(order.Date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(
                            order.PaymentStatus
                          )}`}
                        >
                          {order.PaymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
