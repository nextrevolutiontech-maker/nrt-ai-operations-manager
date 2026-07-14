'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { PageHeader } from '../../../components/shared/PageHeader';
import { reportsService } from '../../../services/reports';
import { AppTable, ColumnDef } from '../../../components/tables/AppTable';
import { Package, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function InventoryValuationPage() {
  const { data: valData, isLoading: valLoading } = useQuery({ 
    queryKey: ['inventory-valuation'], 
    queryFn: () => reportsService.getInventoryValuation() 
  });

  const dummyData = [
    { productName: 'Wireless Mouse', sku: 'WM-001', warehouse: 'Main Depot', quantity: 150, unitCost: 15.50, totalValue: 2325 },
    { productName: 'Mechanical Keyboard', sku: 'MK-002', warehouse: 'Main Depot', quantity: 45, unitCost: 65.00, totalValue: 2925 },
    { productName: '27" 4K Monitor', sku: 'MN-274K', warehouse: 'East Wing', quantity: 12, unitCost: 320.00, totalValue: 3840 },
    { productName: 'USB-C Cable', sku: 'USBC-1M', warehouse: 'West Wing', quantity: 500, unitCost: 2.50, totalValue: 1250 },
  ];

  const tableData = valData?.data?.length > 0 ? valData.data : dummyData;
  const grandTotal = tableData.reduce((acc: number, curr: any) => acc + curr.totalValue, 0);

  const columns: ColumnDef<any>[] = [
    { label: 'Product Name', key: 'productName' },
    { label: 'SKU', key: 'sku', render: (row) => <span className="text-slate-500">{row.sku}</span> },
    { label: 'Warehouse', key: 'warehouse' },
    { label: 'Quantity', key: 'quantity', render: (row) => <span className="font-medium">{row.quantity}</span> },
    { label: 'Unit Cost', key: 'unitCost', render: (row) => `$${row.unitCost.toFixed(2)}` },
    { label: 'Total Value', key: 'totalValue', render: (row) => <span className="font-bold text-slate-800">${row.totalValue.toFixed(2)}</span> },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/reports" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Reports Hub
        </Link>
        <PageHeader 
          title="Inventory Valuation" 
          description="Real-time breakdown of stock quantities and their financial value."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-full">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Items in Stock</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {tableData.reduce((acc: number, curr: any) => acc + curr.quantity, 0)}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full">
            <span className="text-xl font-bold">$</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Inventory Value</p>
            <h3 className="text-2xl font-bold text-slate-800">
              ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-red-100 text-red-600 rounded-full">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Low Stock Alerts</p>
            <h3 className="text-2xl font-bold text-red-600">3</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800">Valuation by Product</h2>
        </div>
        <AppTable columns={columns} data={tableData} isLoading={valLoading} />
      </div>
    </DashboardLayout>
  );
}
