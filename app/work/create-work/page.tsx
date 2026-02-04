'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FormData {
  caustomerName: string;
  PhoneNumber: string;
  Address: string;
  BuildingId: string;
  Date: string;
  ServiceType: 'FullValue' | 'UBR' | 'P2' | 'UninstalationIDUSTB' |'UninstalationODU';
}

export default function CreateWorkPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    caustomerName: '',
    PhoneNumber: '',
    Address: '',
    BuildingId: '',
    Date: '',
    ServiceType: 'FullValue',
  });

  // Check if user is logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/work/create-work');
    }
  }, [user, authLoading, router]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-linear-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d457f]"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, return null (useEffect will handle redirect)
  if (!user) {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.caustomerName.trim()) {
      setError('Customer name is required');
      return false;
    }
    if (!formData.PhoneNumber.trim()) {
      setError('Phone number is required');
      return false;
    }
    const phoneDigitsOnly = formData.PhoneNumber.replace(/\D/g, '');
    if (phoneDigitsOnly.length !== 10) {
      setError('Phone number must be 10 digits');
      return false;
    }
    if (!formData.Address.trim()) {
      setError('Address is required');
      return false;
    }
    if (!formData.BuildingId.trim()) {
      setError('Building ID is required');
      return false;
    }
    if (!formData.Date) {
      setError('Date is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - redirect to login
          router.push('/auth/login?redirect=/work/create-work');
          return;
        }
        throw new Error(data.message || 'Failed to create work order');
      }

      setSuccessMessage('Work order created successfully!');
      
      // Reset form
      setFormData({
        caustomerName: '',
        PhoneNumber: '',
        Address: '',
        BuildingId: '',
        Date: '',
        ServiceType: 'FullValue',
      });

      // Redirect to work orders page after 2 seconds
      setTimeout(() => {
        router.push('/work');
        router.refresh();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating the work order';
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-linear-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl p-8 border-t-4 border-[#0d457f]">
        <h1 className="text-3xl font-bold text-[#0d457f] mb-2">Create Work Order</h1>
        <p className="text-gray-600 mb-8">Fill in the details to create a new work order</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <p className="text-red-700 font-medium flex items-start gap-2">
              <span className="text-red-500 font-bold">⚠</span>
              {error}
            </p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
            <p className="text-green-700 font-medium flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              {successMessage}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="caustomerName" className="text-sm font-semibold text-[#0b2546]">
              Customer Name *
            </Label>
            <Input
              id="caustomerName"
              name="caustomerName"
              type="text"
              placeholder="Enter customer name"
              value={formData.caustomerName}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 border border-[#83bff6] rounded-lg focus:ring-2 focus:ring-[#0d457f] focus:border-transparent transition disabled:bg-gray-100"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="PhoneNumber" className="text-sm font-semibold text-[#0b2546]">
              Phone Number *
            </Label>
            <Input
              id="PhoneNumber"
              name="PhoneNumber"
              type="tel"
              placeholder="10-digit phone number"
              value={formData.PhoneNumber}
              onChange={handleChange}
              disabled={isSubmitting}
              maxLength={15}
              className="w-full px-4 py-2.5 border border-[#83bff6] rounded-lg focus:ring-2 focus:ring-[#0d457f] focus:border-transparent transition disabled:bg-gray-100"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="Address" className="text-sm font-semibold text-[#0b2546]">
              Address *
            </Label>
            <Textarea
              id="Address"
              name="Address"
              placeholder="Enter full address"
              value={formData.Address}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 border border-[#83bff6] rounded-lg focus:ring-2 focus:ring-[#0d457f] focus:border-transparent transition min-h-20 resize-none disabled:bg-gray-100"
            />
          </div>

          {/* Building ID */}
          <div className="space-y-2">
            <Label htmlFor="BuildingId" className="text-sm font-semibold text-[#0b2546]">
              Building ID *
            </Label>
            <Input
              id="BuildingId"
              name="BuildingId"
              type="text"
              placeholder="Enter building ID"
              value={formData.BuildingId}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 border border-[#83bff6] rounded-lg focus:ring-2 focus:ring-[#0d457f] focus:border-transparent transition disabled:bg-gray-100"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="Date" className="text-sm font-semibold text-[#0b2546]">
              Work Date *
            </Label>
            <Input
              id="Date"
              name="Date"
              type="date"
              value={formData.Date}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 border border-[#83bff6] rounded-lg focus:ring-2 focus:ring-[#0d457f] focus:border-transparent transition disabled:bg-gray-100"
            />
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <Label htmlFor="ServiceType" className="text-sm font-semibold text-[#0b2546]">
              Service Type *
            </Label>
            <select
              id="ServiceType"
              name="ServiceType"
              value={formData.ServiceType}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 border border-[#83bff6] rounded-lg focus:ring-2 focus:ring-[#0d457f] focus:border-transparent transition bg-white disabled:bg-gray-100"
            >
              <option value="FullValue">Full Value</option>
              <option value="UBR">UBR</option>
              <option value="P2">P2</option>
              <option value="UninstalationIDUSTB">Uninstall IDU/STB</option>
              <option value="UninstalationODU">Uninstall ODU</option>
            </select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#0d457f] hover:bg-[#0a3a66] text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Work Order...' : 'Create Work Order'}
          </Button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          Fields marked with * are required
        </p>
      </div>
    </div>
  );
}
