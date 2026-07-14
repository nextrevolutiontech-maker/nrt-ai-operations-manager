'use client';

import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../../../services/inventory';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { PageHeader } from '../../../components/shared/PageHeader';
import { AppTable, ColumnDef } from '../../../components/tables/AppTable';
import { Package, AlertTriangle } from 'lucide-react';

export default function StockViewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['inventories'],
    queryFn: () => inventoryService.getAll(),
  });

  const columns: ColumnDef[] = [
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
      key: 'warehouse', 
      label: 'Warehouse',
      render: (row) => row.warehouse?.name || '-'
    },
    { 
      key: 'quantity', 
      label: 'Quantity',
      render: (row) => {
        const qty = row.quantity;
        const minStock = row.product?.minStockLevel || 0;
        const isLowStock = qty <= minStock;

        return (
          <div className={`flex items-center gap-1.5 font-medium ${isLowStock ? 'text-orange-600' : 'text-slate-700'}`}>
            {qty} {row.product?.unit?.symbol || ''}
            {isLowStock && <AlertTriangle className="w-4 h-4 text-orange-500" />}
          </div>
        );
      }
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => {
        const qty = row.quantity;
        const minStock = row.product?.minStockLevel || 0;
        
        if (qty <= 0) return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">OUT OF STOCK</span>;
        if (qty <= minStock) return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">LOW STOCK</span>;
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">IN STOCK</span>;
      }
    }
  ];

  return (
    <DashboardLayout>
      <PageHeader 
        title="Stock Levels" 
        description="Real-time view of inventory across all warehouses"
        action={
          <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white rounded-lg shadow-sm border border-slate-200">
            <Package className="w-4 h-4 text-slate-400" />
            Total Records: {data?.data?.length || 0}
          </div>
        }
      />
      
      <div className="mt-6">
        <AppTable 
          columns={columns} 
          data={data?.data || []} 
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
}
