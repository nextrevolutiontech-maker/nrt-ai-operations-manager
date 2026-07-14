'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { PageHeader } from '../../../components/shared/PageHeader';
import { reportsService } from '../../../services/reports';
import { AppTable, ColumnDef } from '../../../components/tables/AppTable';
import { TrendingUp, Users, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SalesPerformancePage() {
  const [period, setPeriod] = useState('This Month');
  const { data: salesData, isLoading } = useQuery({ 
    queryKey: ['sales-performance', period], 
    queryFn: () => reportsService.getSalesPerformance() 
  });

  const chartData = [
    { name: 'Week 1', revenue: 12000, orders: 45 },
    { name: 'Week 2', revenue: 19000, orders: 70 },
    { name: 'Week 3', revenue: 15000, orders: 55 },
    { name: 'Week 4', revenue: 22000, orders: 85 },
  ];

  const topProducts = [
    { name: 'Mechanical Keyboard', unitsSold: 120, revenue: 7800 },
    { name: 'Wireless Mouse', unitsSold: 85, revenue: 1317.50 },
    { name: 'USB-C Hub', unitsSold: 64, revenue: 1920 },
  ];

  const columns: ColumnDef<any>[] = [
    { label: 'Product Name', key: 'name' },
    { label: 'Units Sold', key: 'unitsSold', render: (row) => <span className="font-medium text-slate-700">{row.unitsSold}</span> },
    { label: 'Total Revenue', key: 'revenue', render: (row) => <span className="font-bold text-emerald-600">${row.revenue.toFixed(2)}</span> },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/reports" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Reports Hub
        </Link>
        <div className="flex justify-between items-end">
          <PageHeader 
            title="Sales Performance" 
            description="Analyze revenue trends, orders, and top-selling products."
          />
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white"
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>This Quarter</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Revenue</p>
            <h3 className="text-2xl font-bold text-slate-800">$68,000.00</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Orders</p>
            <h3 className="text-2xl font-bold text-slate-800">255</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-amber-100 text-amber-600 rounded-full">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Unique Customers</p>
            <h3 className="text-2xl font-bold text-slate-800">142</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Revenue Trend</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 0, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Top Selling Products</h2>
          <AppTable columns={columns} data={topProducts} isLoading={isLoading} />
        </div>
      </div>

    </DashboardLayout>
  );
}
