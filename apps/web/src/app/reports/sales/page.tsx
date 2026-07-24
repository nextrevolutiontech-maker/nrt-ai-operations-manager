'use client';

import React from 'react';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { PageHeader } from '../../../components/shared/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../../../services/reports';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';

export default function SalesPerformancePage() {
  const { data: salesData, isLoading } = useQuery({ 
    queryKey: ['sales-performance'], 
    queryFn: () => reportsService.getSalesPerformance() 
  });

  const chartData = salesData?.data?.chartData || [];
  const totalRevenue = salesData?.data?.totalRevenue || 0;
  const totalOrders = salesData?.data?.totalOrders || 0;

  return (
    <DashboardLayout>
      <PageHeader 
        title="Sales Performance" 
        description="Detailed analytics of revenue trends and order volumes"
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-slate-500 animate-pulse">Loading sales data...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 mt-8 md:grid-cols-3">
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-4 bg-emerald-100 text-emerald-600 rounded-xl">
                <DollarSign className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Revenue</p>
                <h3 className="text-3xl font-bold text-slate-800">${totalRevenue.toLocaleString()}</h3>
              </div>
            </div>
            
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-4 bg-blue-100 text-blue-600 rounded-xl">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Orders</p>
                <h3 className="text-3xl font-bold text-slate-800">{totalOrders}</h3>
              </div>
            </div>
            
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-4 bg-purple-100 text-purple-600 rounded-xl">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Avg. Order Value</p>
                <h3 className="text-3xl font-bold text-slate-800">
                  ${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0}
                </h3>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Revenue Trend (Last 7 Days)</h2>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `$${value}`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    formatter={(value: any) => [`$${value}`, 'Sales']}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
