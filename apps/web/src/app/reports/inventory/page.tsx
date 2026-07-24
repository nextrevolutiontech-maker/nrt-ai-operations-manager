'use client';

import React from 'react';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { PageHeader } from '../../../components/shared/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../../../services/reports';
import { inventoryService } from '../../../services/inventory';
import { PackageSearch, AlertTriangle, BoxSelect, ShieldAlert } from 'lucide-react';

export default function InventoryValuationPage() {
  const { data: analyticsData, isLoading: aLoading } = useQuery({ 
    queryKey: ['inventory-analytics'], 
    queryFn: () => reportsService.getInventoryValuation() 
  });
  
  const { data: inventoryData, isLoading: iLoading } = useQuery({
    queryKey: ['inventory-list'],
    queryFn: () => inventoryService.getAll()
  });

  const lowStock = analyticsData?.data?.lowStock || 0;
  const outOfStock = analyticsData?.data?.outOfStock || 0;
  const totalStockQuantity = analyticsData?.data?.totalStockQuantity || 0;
  
  // Calculate total valuation
  const totalValuation = inventoryData?.data?.reduce((acc: number, item: any) => {
    return acc + (item.availableStock * (item.product?.cost || 0));
  }, 0) || 0;

  return (
    <DashboardLayout>
      <PageHeader 
        title="Inventory Valuation" 
        description="Monitor stock levels, warehouse distribution, and total asset value."
      />

      {(aLoading || iLoading) ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-slate-500 animate-pulse">Loading inventory data...</p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Items</p>
                  <h3 className="text-3xl font-bold text-slate-800">{totalStockQuantity}</h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                  <BoxSelect className="w-6 h-6" />
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Valuation</p>
                  <h3 className="text-3xl font-bold text-slate-800">${totalValuation.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                  <PackageSearch className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Low Stock</p>
                  <h3 className="text-3xl font-bold text-amber-600">{lowStock}</h3>
                </div>
                <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Out of Stock</p>
                  <h3 className="text-3xl font-bold text-red-600">{outOfStock}</h3>
                </div>
                <div className="p-3 bg-red-100 rounded-xl text-red-600">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Inventory Valuation Register</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Warehouse</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit Cost</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Value</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventoryData?.data?.map((item: any) => {
                    const cost = item.product?.cost || 0;
                    const value = item.availableStock * cost;
                    const minStock = item.product?.minStockLevel || 0;
                    
                    let statusBadge = <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">In Stock</span>;
                    if (item.availableStock === 0) {
                      statusBadge = <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Out of Stock</span>;
                    } else if (item.availableStock <= minStock) {
                      statusBadge = <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">Low Stock</span>;
                    }

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800">{item.product?.name}</div>
                          <div className="text-xs text-slate-400">{item.product?.sku}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.warehouse?.name}</td>
                        <td className="px-6 py-4 font-medium text-slate-800">{item.availableStock}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">${cost.toLocaleString()}</td>
                        <td className="px-6 py-4 font-medium text-slate-800">${value.toLocaleString()}</td>
                        <td className="px-6 py-4">{statusBadge}</td>
                      </tr>
                    );
                  })}
                  {(!inventoryData?.data || inventoryData.data.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                        No inventory data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
