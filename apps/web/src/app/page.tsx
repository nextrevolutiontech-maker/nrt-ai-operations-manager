'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { productService } from '../services/master-data';
import { warehouseService, inventoryService } from '../services/inventory';
import { reportsService } from '../services/reports';
import { Package, MapPin, Layers, TrendingUp, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Home() {
  const { data: productsData, isLoading: pLoading } = useQuery({ queryKey: ['products'], queryFn: () => productService.getAll() });
  const { data: warehousesData, isLoading: wLoading } = useQuery({ queryKey: ['warehouses'], queryFn: () => warehouseService.getAll() });
  const { data: inventoryData, isLoading: iLoading } = useQuery({ queryKey: ['inventories'], queryFn: () => inventoryService.getAll() });
  const { data: salesData, isLoading: sLoading } = useQuery({ queryKey: ['sales-performance'], queryFn: () => reportsService.getSalesPerformance() });

  const totalProducts = productsData?.data?.length || 0;
  const totalWarehouses = warehousesData?.data?.length || 0;
  
  // Calculate low stock items
  const lowStockCount = inventoryData?.data?.filter((inv: any) => inv.quantity <= (inv.product?.minStockLevel || 0)).length || 0;
  const totalStockItems = inventoryData?.data?.reduce((acc: number, curr: any) => acc + curr.quantity, 0) || 0;

  const defaultChartData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];
  
  const chartData = salesData?.data?.length > 0 ? salesData.data : defaultChartData;

  const kpis = [
    { title: 'Total Products', value: pLoading ? '...' : totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Warehouses', value: wLoading ? '...' : totalWarehouses, icon: MapPin, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { title: 'Low Stock Alerts', value: iLoading ? '...' : lowStockCount, icon: AlertCircle, color: lowStockCount > 0 ? 'text-red-600' : 'text-emerald-600', bg: lowStockCount > 0 ? 'bg-red-100' : 'bg-emerald-100' },
    { title: 'Total Items in Stock', value: iLoading ? '...' : totalStockItems, icon: Layers, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <DashboardLayout>
      <PageHeader 
        title="Operations Dashboard" 
        description="Overview of your business metrics and system status"
      />

      <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white to-slate-50 opacity-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform`}></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{kpi.title}</p>
                <h3 className="text-3xl font-bold text-slate-800">{kpi.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
            <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-6">
            {inventoryData?.data?.slice(0, 5).map((inv: any, i: number) => (
              <div key={i} className="flex gap-4 items-start relative">
                <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-blue-500 z-10 outline outline-4 outline-white"></div>
                {i !== 4 && <div className="absolute top-3 left-1 w-[2px] h-full bg-slate-100 -z-0"></div>}
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Stock updated for <span className="text-blue-600">{inv.product?.name}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {inv.quantity} {inv.product?.unit?.symbol} available at {inv.warehouse?.name}
                  </p>
                </div>
              </div>
            ))}
            {(!inventoryData?.data || inventoryData.data.length === 0) && !iLoading && (
              <div className="text-center text-slate-400 py-10">
                <p>No recent activity</p>
              </div>
            )}
            {iLoading && (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4">
                    <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-slate-200"></div>
                    <div>
                      <div className="h-4 w-48 bg-slate-200 rounded mb-1"></div>
                      <div className="h-3 w-24 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Sales Trend
            </h2>
            <button className="text-sm text-blue-600 font-medium hover:underline">View Report</button>
          </div>
          {sLoading ? (
            <div className="flex items-center justify-center h-64 text-slate-400">Loading chart...</div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
