'use client';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import ProtectedRoute from '../shared/ProtectedRoute';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="pl-64">
          <Header />
          <main className="p-6 max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
