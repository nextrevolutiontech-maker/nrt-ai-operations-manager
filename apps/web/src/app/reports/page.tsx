'use client';

import React from 'react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { PageHeader } from '../../components/shared/PageHeader';
import { BarChart3, TrendingUp, PackageSearch, FileText, ChevronRight, Download, Printer, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ReportsHubPage() {
  const reports = [
    {
      title: 'Sales & Revenue Performance',
      description: 'View live revenue trends, order volume breakdown, and customer sales performance.',
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      href: '/reports/sales'
    },
    {
      title: 'Inventory & Asset Valuation',
      description: 'Analyze current stock valuation across warehouses, low stock alerts, and unit costs.',
      icon: PackageSearch,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100',
      href: '/reports/inventory'
    },
    {
      title: 'Financial Profit & Loss (P&L)',
      description: 'Track net income against operating expenses over active fiscal periods.',
      icon: BarChart3,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      href: '/reports/finance'
    },
    {
      title: 'Custom BI Dashboards',
      description: 'Configure and monitor real-time executive widgets and custom operational BI charts.',
      icon: FileText,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
      href: '/dashboards'
    }
  ];

  const handleQuickPrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <PageHeader 
          title="Executive Reports & PDF Center" 
          description="Access standard BI analytics, financial statements, and generate official PDF reports."
        />

        <div className="flex items-center gap-3 print:hidden">
          <button
            onClick={handleQuickPrint}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Print / Export PDF Summary</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {reports.map((report, idx) => (
          <Link href={report.href} key={idx} className="block group">
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 relative overflow-hidden flex items-start gap-4">
              <div className={`p-4 rounded-2xl ${report.bg} shrink-0 group-hover:scale-110 transition-transform`}>
                <report.icon className={`w-8 h-8 ${report.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                  {report.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {report.description}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
