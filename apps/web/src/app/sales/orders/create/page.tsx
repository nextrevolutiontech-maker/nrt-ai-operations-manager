'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { salesOrderService } from '../../../../services/sales';
import { DashboardLayout } from '../../../../components/layouts/DashboardLayout';
import { SalesOrderForm } from '../../../../components/forms/SalesOrderForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateSalesOrderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: salesOrderService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      router.push('/sales/orders');
    },
  });

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/sales/orders">
            <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create Sales Order</h1>
            <p className="text-slate-500 mt-1">Generate a new SO for your customers</p>
          </div>
        </div>

        <SalesOrderForm 
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      </div>
    </DashboardLayout>
  );
}
