'use client';

import React from 'react';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { PageHeader } from '../../../components/shared/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../../../services/reports';
import { ArrowUpRight, ArrowDownRight, Building2, Wallet } from 'lucide-react';

export default function FinancePerformancePage() {
  const { data: financeData, isLoading } = useQuery({ 
    queryKey: ['finance-performance'], 
    queryFn: () => reportsService.getProfitAndLoss() 
  });

  const totalRevenue = financeData?.data?.totalRevenue || 0;
  const totalExpenses = financeData?.data?.totalExpenses || 0;
  const netProfit = financeData?.data?.netProfit || 0;
  const margin = financeData?.data?.margin || 0;

  return (
    <DashboardLayout>
      <PageHeader 
        title="Financial Profit & Loss" 
        description="Analyze your company's revenue, expenses, and net profitability"
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-slate-500 animate-pulse">Calculating financials...</p>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {/* High-level metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-600">
                <ArrowUpRight className="w-24 h-24" />
              </div>
              <p className="text-sm font-medium text-slate-500 mb-2">Total Revenue</p>
              <h3 className="text-3xl font-bold text-slate-800">${totalRevenue.toLocaleString()}</h3>
              <p className="text-xs text-emerald-600 flex items-center mt-2 font-medium">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                Operating Income
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-red-600">
                <ArrowDownRight className="w-24 h-24" />
              </div>
              <p className="text-sm font-medium text-slate-500 mb-2">Total Expenses</p>
              <h3 className="text-3xl font-bold text-slate-800">${totalExpenses.toLocaleString()}</h3>
              <p className="text-xs text-red-600 flex items-center mt-2 font-medium">
                <ArrowDownRight className="w-3 h-3 mr-1" />
                Operating Costs
              </p>
            </div>
            
            <div className="p-6 bg-slate-800 rounded-2xl shadow-md border border-slate-700 relative overflow-hidden lg:col-span-2">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-white">
                <Building2 className="w-32 h-32" />
              </div>
              <p className="text-sm font-medium text-slate-400 mb-2">Net Profit</p>
              <div className="flex items-end gap-4">
                <h3 className={`text-5xl font-black tracking-tight ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${netProfit.toLocaleString()}
                </h3>
                <div className="mb-2 px-3 py-1 rounded-full bg-slate-700 text-sm font-medium text-white border border-slate-600">
                  {margin.toFixed(1)}% Margin
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-4 max-w-sm">
                This is your final bottom line after subtracting all expenses from your total revenue.
              </p>
            </div>
          </div>

          {/* P&L Statement breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-600" />
                P&L Statement Breakdown
              </h3>
              <button className="text-sm font-medium text-blue-600 hover:underline">Export PDF</button>
            </div>
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">Gross Revenue</td>
                    <td className="px-6 py-4 font-medium text-slate-800 text-right">${totalRevenue.toLocaleString()}</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">Operating Expenses</td>
                    <td className="px-6 py-4 font-medium text-red-600 text-right">-${totalExpenses.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td className="px-6 py-4 font-bold text-slate-900 text-lg">Net Income</td>
                    <td className={`px-6 py-4 font-bold text-lg text-right ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      ${netProfit.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
