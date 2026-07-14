'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockMovementService, warehouseService } from '../../../services/inventory';
import { productService } from '../../../services/master-data';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { PageHeader } from '../../../components/shared/PageHeader';
import { AppTable, ColumnDef } from '../../../components/tables/AppTable';
import { StockMovementForm, StockMovementFormData } from '../../../components/forms/StockMovementForm';
import { Plus, ArrowRightLeft, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

export default function StockAdjustmentsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: movementsData, isLoading: isLoadingMovements } = useQuery({
    queryKey: ['stockMovements'],
    queryFn: () => stockMovementService.getAll(),
  });

  const { data: productsData } = useQuery({ queryKey: ['products'], queryFn: () => productService.getAll() });
  const { data: warehousesData } = useQuery({ queryKey: ['warehouses'], queryFn: () => warehouseService.getAll() });

  const createMutation = useMutation({
    mutationFn: (data: StockMovementFormData) => stockMovementService.create({
      ...data,
      fromWarehouseId: data.type === 'OUT' || data.type === 'TRANSFER' ? data.warehouseId : undefined,
      toWarehouseId: data.type === 'IN' || data.type === 'TRANSFER' ? data.warehouseId : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['inventories'] }); // refresh stock view
      setIsFormOpen(false);
    },
  });

  const onSubmitForm = async (formData: StockMovementFormData) => {
    await createMutation.mutateAsync(formData);
  };

  const columns: ColumnDef[] = [
    { 
      key: 'date', 
      label: 'Date',
      render: (row) => new Date(row.createdAt).toLocaleDateString() + ' ' + new Date(row.createdAt).toLocaleTimeString()
    },
    { 
      key: 'type', 
      label: 'Type',
      render: (row) => {
        if (row.type === 'IN') return <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700"><ArrowDownToLine className="w-3 h-3"/> IN</span>;
        if (row.type === 'OUT') return <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700"><ArrowUpFromLine className="w-3 h-3"/> OUT</span>;
        return <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700"><ArrowRightLeft className="w-3 h-3"/> TRANSFER</span>;
      }
    },
    { 
      key: 'product', 
      label: 'Product',
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.product?.name || '-'}</div>
          <div className="text-xs text-slate-500">SKU: {row.product?.sku || '-'}</div>
        </div>
      )
    },
    { 
      key: 'quantity', 
      label: 'Quantity',
      render: (row) => (
        <span className="font-medium">
          {row.type === 'IN' ? '+' : '-'}{row.quantity}
        </span>
      )
    },
    { 
      key: 'warehouse', 
      label: 'Warehouse',
      render: (row) => {
        if (row.type === 'IN') return <span className="text-blue-600">To: {row.toWarehouse?.name || '-'}</span>;
        if (row.type === 'OUT') return <span className="text-red-600">From: {row.fromWarehouse?.name || '-'}</span>;
        return <span>{row.fromWarehouse?.name} &rarr; {row.toWarehouse?.name}</span>;
      }
    },
    { key: 'reference', label: 'Reference', render: (row) => row.reference || '-' },
  ];

  return (
    <DashboardLayout>
      <PageHeader 
        title="Stock Adjustments" 
        description="Record manual stock IN, OUT, and view movement history"
        action={
          <button 
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Adjustment
          </button>
        }
      />
      
      <div className="mt-6">
        <AppTable 
          columns={columns} 
          data={movementsData?.data || []} 
          isLoading={isLoadingMovements}
        />
      </div>

      <StockMovementForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={onSubmitForm}
        isLoading={createMutation.isPending}
        products={productsData?.data || []}
        warehouses={warehousesData?.data || []}
      />
    </DashboardLayout>
  );
}
