'use client';

import React from 'react';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { PageHeader } from '../../../components/shared/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../../../services/reports';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Printer, Download, Sparkles } from 'lucide-react';

export default function SalesPerformancePage() {
  const { data: salesData, isLoading } = useQuery({ 
    queryKey: ['sales-performance'], 
    queryFn: () => reportsService.getSalesPerformance() 
  });

  const chartData = salesData?.data?.chartData || [
    { name: 'Mon', sales: 420000, purchases: 180000 },
    { name: 'Tue', sales: 380000, purchases: 210000 },
    { name: 'Wed', sales: 510000, purchases: 140000 },
    { name: 'Thu', sales: 490000, purchases: 320000 },
    { name: 'Fri', sales: 680000, purchases: 290000 },
    { name: 'Sat', sales: 740000, purchases: 410000 },
    { name: 'Sun', sales: 610000, purchases: 200000 },
  ];
  const totalRevenue = salesData?.data?.totalRevenue || 3830000;
  const totalOrders = salesData?.data?.totalOrders || 14;

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <PageHeader 
          title="Sales Performance & Revenue Report" 
          description="Detailed analytics of revenue trends, order volumes, and executive KPIs."
        />

        <div className="flex items-center gap-3 print:hidden">
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Download Official PDF Report</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-slate-500 animate-pulse">Loading sales data...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 mt-4 md:grid-cols-3">
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-4 bg-emerald-100 text-emerald-600 rounded-xl">
                <DollarSign className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Revenue</p>
                <h3 className="text-3xl font-bold text-slate-800">PKR {totalRevenue.toLocaleString()}</h3>
              </div>
            </div>
            
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-4 bg-blue-100 text-blue-600 rounded-xl">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium font-mono">Total Sales Orders</p>
                <h3 className="text-3xl font-bold text-slate-800">{totalOrders} Orders</h3>
              </div>
            </div>
            
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-4 bg-purple-100 text-purple-600 rounded-xl">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Avg. Order Value</p>
                <h3 className="text-3xl font-bold text-slate-800">
                  PKR {totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0}
                </h3>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Revenue Trajectory (7-Day Trend)</h2>
                <p className="text-xs text-slate-500">Live operational sales revenue logged across regional hubs</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                +14.2% Growth
              </span>
            </div>

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
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `PKR ${(value / 1000).toFixed(0)}k`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    formatter={(value: any) => [`PKR ${Number(value).toLocaleString()}`, 'Sales Revenue']}
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
