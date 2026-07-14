'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { PageHeader } from '../../../components/shared/PageHeader';
import { reportsService } from '../../../services/reports';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function FinanceReportPage() {
  const [period, setPeriod] = useState('This Year');
  const { data: financeData, isLoading } = useQuery({ 
    queryKey: ['finance-pl', period], 
    queryFn: () => reportsService.getProfitAndLoss() 
  });

  const dummyPL = {
    revenue: 145000,
    costOfGoodsSold: 65000,
    grossProfit: 80000,
    operatingExpenses: {
      salaries: 25000,
      rent: 5000,
      utilities: 1500,
      marketing: 8500,
      other: 3000
    },
    totalExpenses: 43000,
    netIncome: 37000
  };

  const pl = financeData?.data || dummyPL;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/reports" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Reports Hub
        </Link>
        <div className="flex justify-between items-end">
          <PageHeader 
            title="Profit & Loss Statement" 
            description="Financial summary of revenues, costs, and expenses."
          />
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white"
          >
            <option>This Month</option>
            <option>This Quarter</option>
            <option>This Year</option>
            <option>Last Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Total Revenue</h3>
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-800">${pl.revenue.toLocaleString()}</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Total Expenses</h3>
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-800">${(pl.costOfGoodsSold + pl.totalExpenses).toLocaleString()}</h2>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg border border-slate-700 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full mix-blend-multiply filter blur-2xl opacity-30"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-medium text-slate-300">Net Income</h3>
            <div className="p-2 bg-white/10 text-emerald-400 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white relative z-10">${pl.netIncome.toLocaleString()}</h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-w-4xl mx-auto">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Income Statement Breakdown</h2>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Revenue Section */}
          <div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="font-semibold text-slate-800">Operating Revenue</span>
              <span className="font-semibold text-slate-800">${pl.revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 text-slate-600 pl-4">
              <span>Sales Revenue</span>
              <span>${pl.revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 text-slate-600 pl-4 border-b border-slate-100">
              <span>Cost of Goods Sold (COGS)</span>
              <span className="text-red-600">- ${pl.costOfGoodsSold.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-slate-50 px-4 rounded-lg mt-2">
              <span className="font-bold text-slate-800">Gross Profit</span>
              <span className="font-bold text-emerald-600">${pl.grossProfit.toLocaleString()}</span>
            </div>
          </div>

          {/* Expenses Section */}
          <div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="font-semibold text-slate-800">Operating Expenses</span>
              <span className="font-semibold text-slate-800">${pl.totalExpenses.toLocaleString()}</span>
            </div>
            {Object.entries(pl.operatingExpenses).map(([key, value]: any) => (
              <div key={key} className="flex justify-between items-center py-2 text-slate-600 pl-4">
                <span className="capitalize">{key}</span>
                <span>${value.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Net Income */}
          <div className="flex justify-between items-center py-4 px-4 bg-slate-800 text-white rounded-xl mt-8">
            <span className="font-bold text-lg">Net Income</span>
            <span className="font-bold text-2xl text-emerald-400">${pl.netIncome.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
