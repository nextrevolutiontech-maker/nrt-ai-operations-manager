'use client';

import React from 'react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { PageHeader } from '../../components/shared/PageHeader';
import { BarChart3, TrendingUp, PackageSearch, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ReportsHubPage() {
  const reports = [
    {
      title: 'Sales Performance',
      description: 'View revenue trends, top products, and overall sales growth.',
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      href: '/reports/sales'
    },
    {
      title: 'Inventory Valuation',
      description: 'Analyze current stock value, low stock alerts, and warehouse distribution.',
      icon: PackageSearch,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100',
      href: '/reports/inventory'
    },
    {
      title: 'Financial Profit & Loss',
      description: 'Track income against expenses over specified periods.',
      icon: BarChart3,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      href: '/reports/finance'
    },
    {
      title: 'Custom Dashboards',
      description: 'Build and manage your own custom BI dashboards and widgets.',
      icon: FileText,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
      href: '/dashboards'
    }
  ];

  return (
    <DashboardLayout>
      <PageHeader 
        title="Reports Hub" 
        description="Access all standard business intelligence and analytics reports."
      />

      <div className="grid gap-6 mt-8 md:grid-cols-2">
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
