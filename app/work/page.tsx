'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface WorkOrder {
  id: number;
  caustomerName: string;
  PhoneNumber: string;
  Address?: string;
  BuildingId: string;
  Date: string;
  ServiceType: 'FullValue' | 'UBR' | 'P2' | 'UninstalationIDUSTB' | 'UninstalationODU';
  PaymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
    case 'UninstalationIDUSTB':
    case 'UninstalationODU':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function WorkPage() {
  const { data, error, isLoading } = useSWR('/api/work', fetcher);
  const workOrders = (data?.workOrders || []) as WorkOrder[];

  return (
    <div className="min-h-screen bg-[#f1f7fe] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#0d457f] mb-2">Work Orders</h1>
            <p className="text-[#0b2546]">Manage your work orders and track their status</p>
          </div>
          <Link href="/work/create-work">
            <Button className="bg-[#0d457f] hover:bg-[#0a3a66] text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md">
              + Create Work Order
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 font-medium">
            Failed to load work orders.
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d457f]"></div>
            <p className="mt-4 text-gray-600 font-medium font-sans">Syncing records...</p>
          </div>
        ) : workOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center border-t-4 border-[#83bff6]">
            <p className="text-gray-600 text-lg mb-4">No work orders yet</p>
            <p className="text-gray-500 mb-6 font-medium">Create your first work order to get started</p>
            <Link href="/work/create-work">
              <Button className="bg-[#0d457f] hover:bg-[#0a3a66] text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                Create First Work Order
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border-t-4 border-[#0d457f]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f8fafc] border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#0b2546]">
                      Customer Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#0b2546]">
                      Building ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#0b2546]">
                      Address
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#0b2546]">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#0b2546]">
                      Service Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#0b2546]">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#0b2546]">
                      Payment Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {workOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 capitalize">
                        {order.caustomerName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium whitespace-nowrap">
                        {order.BuildingId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        {order.Address || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        {order.PhoneNumber}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getServiceTypeColor(
                            order.ServiceType
                          )}`}
                        >
                          {order.ServiceType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        {new Date(order.Date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getPaymentStatusColor(
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
