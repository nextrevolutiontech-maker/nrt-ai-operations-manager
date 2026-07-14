'use client';

import { useQuery } from '@tanstack/react-query';
import { purchaseOrderService } from '../../../services/procurement';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { AppTable, ColumnDef } from '../../../components/tables/AppTable';
import { Button } from '../../../components/shared/Button';
import { Plus, Eye, Truck, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function PurchaseOrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: () => purchaseOrderService.getAll(),
  });

  const columns: ColumnDef[] = [
    { key: 'orderNumber', label: 'PO Number' },
    { 
      key: 'supplier', 
      label: 'Supplier',
      render: (row) => row.supplier?.name || 'Unknown'
    },
    { 
      key: 'orderDate', 
      label: 'Order Date',
      render: (row) => new Date(row.orderDate).toLocaleDateString()
    },
    { 
      key: 'totalAmount', 
      label: 'Total Amount',
      render: (row) => <span className="font-medium">${Number(row.totalAmount).toFixed(2)}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        let color = 'bg-slate-100 text-slate-700';
        if (row.status === 'APPROVED') color = 'bg-blue-100 text-blue-700';
        if (row.status === 'PARTIALLY_RECEIVED') color = 'bg-orange-100 text-orange-700';
        if (row.status === 'COMPLETED') color = 'bg-green-100 text-green-700';
        if (row.status === 'PENDING_APPROVAL') color = 'bg-yellow-100 text-yellow-700';
        
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>
            {row.status.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link href={`/procurement/purchase-orders/${row.id}`}>
            <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="View Details">
              <Eye className="w-4 h-4" />
            </button>
          </Link>
          {row.status === 'DRAFT' && (
            <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Submit for Approval">
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {(row.status === 'APPROVED' || row.status === 'PARTIALLY_RECEIVED') && (
            <button className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Receive Items">
              <Truck className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
            <p className="text-slate-500 mt-1">Manage vendor orders and receiving</p>
          </div>
          <Link href="/procurement/purchase-orders/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create PO
            </Button>
          </Link>
        </div>

        <AppTable
          columns={columns}
          data={data?.items || []}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
}
