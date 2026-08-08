'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import ProtectedRoute from '../shared/ProtectedRoute';
import { AiVoiceButton } from '../ai/AiVoiceButton';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {children}
        </main>
        {pathname === '/ai' && <AiVoiceButton />}
      </div>
    </ProtectedRoute>
  );
}
