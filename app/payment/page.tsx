'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface BankDetails {
  id: number;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  accountHolder: string;
  createdAt: string;
}

interface PaymentStats {
  totalWorks: number;
  approvedWorks: number;
  completedPayment: number;
  pendingPayment: number;
  failedPayment: number;
  pendingAmount: number;
}

export default function PaymentPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [bankFormData, setBankFormData] = useState({
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    accountHolder: '',
  });
  const [bankSubmitting, setBankSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchPaymentData();
    }
  }, [user, isLoading, router]);

  const fetchPaymentData = async () => {
    try {
      setPageLoading(true);
      setError(null);
      const response = await fetch('/api/payment', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch payment data');

      const data = await response.json();
      setBankDetails(data.bankDetails);
      setPaymentStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setPageLoading(false);
    }
  };

  const handleBankDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setBankSubmitting(true);
      setError(null);
      const response = await fetch('/api/payment/bank-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(bankFormData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update bank details');

      setBankDetails(data.bankDetails);
      setSuccessMessage('Bank details updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bank details');
    } finally {
      setBankSubmitting(false);
    }
  };

  if (isLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <Link href="/" className="text-blue-600 hover:underline">← Back to Home</Link>
          <h1 className="text-3xl font-bold text-gray-900">Payment & Work History</h1>
          <div className="w-20"></div>
        </div>

        {successMessage && <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">{successMessage}</div>}
        {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Bank Details Display or Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-blue-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Bank Account</h2>
              
              {bankDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Account Holder</label>
                    <p className="text-lg font-medium text-gray-900">{bankDetails.accountHolder}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Bank Name</label>
                    <p className="text-lg font-medium text-gray-900">{bankDetails.bankName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Account Number</label>
                    <p className="text-lg font-medium text-gray-900">****{bankDetails.accountNumber.slice(-4)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">IFSC Code</label>
                    <p className="text-lg font-medium text-gray-900">{bankDetails.ifscCode}</p>
                  </div>
                </div>
              ) : (
                // Replace the form section inside the bankDetails ternary with this:

<form onSubmit={handleUpdateBankDetails} className="space-y-6">
  <div className="border-b border-gray-100 pb-4 mb-4">
    <p className="text-gray-600">
      Please provide your bank account information accurately. 
      <span className="text-red-500 font-medium"> Note: </span> 
      These details will be used for all future payouts.
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
    {/* Account Holder */}
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
        Account Holder Name
      </label>
      <input
        type="text"
        name="accountHolder"
        value={bankFormData.accountHolder}
        onChange={handleBankDetailsChange}
        placeholder="e.g. John Doe"
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all duration-200"
        required
      />
    </div>

    {/* Bank Name */}
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
        Bank Name
      </label>
      <input
        type="text"
        name="bankName"
        value={bankFormData.bankName}
        onChange={handleBankDetailsChange}
        placeholder="e.g. HDFC Bank"
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all duration-200"
        required
      />
    </div>

    {/* Account Number */}
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
        Account Number
      </label>
      <input
        type="text"
        name="accountNumber"
        value={bankFormData.accountNumber}
        onChange={handleBankDetailsChange}
        placeholder="Enter your full account number"
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all duration-200 font-mono"
        required
      />
    </div>

    {/* IFSC Code */}
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
        IFSC Code
      </label>
      <input
        type="text"
        name="ifscCode"
        value={bankFormData.ifscCode}
        onChange={handleBankDetailsChange}
        placeholder="e.g. HDFC0001234"
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all duration-200 font-mono uppercase"
        required
      />
    </div>
  </div>

  <div className="pt-4">
    <button
      type="submit"
      disabled={bankSubmitting}
      className={`w-full md:w-auto px-10 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
        bankSubmitting 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200'
      }`}
    >
      {bankSubmitting ? (
        <span className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Saving Details...
        </span>
      ) : (
        'Verify & Save Bank Details'
      )}
    </button>
  </div>
</form>
              )}
            </div>
          </div>

          {/* Right Column: Work & Payment Stats */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 px-1">Work Overview</h2>
            
            <div className="bg-white rounded-lg shadow p-5 border-t-4 border-blue-500">
              <p className="text-xs font-bold text-gray-500 uppercase">Past Works Done</p>
              <p className="text-3xl font-bold text-blue-600">{paymentStats?.totalWorks || 0}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-5 border-t-4 border-green-500">
              <p className="text-xs font-bold text-gray-500 uppercase">Payments Completed</p>
              <p className="text-3xl font-bold text-green-600">{paymentStats?.completedPayment || 0}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-5 border-t-4 border-yellow-500">
              <p className="text-xs font-bold text-gray-500 uppercase">Payments Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{paymentStats?.pendingPayment || 0}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-5 border-t-4 border-red-500">
              <p className="text-xs font-bold text-gray-500 uppercase">Payments Failed</p>
              <p className="text-3xl font-bold text-red-600">{paymentStats?.failedPayment || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}