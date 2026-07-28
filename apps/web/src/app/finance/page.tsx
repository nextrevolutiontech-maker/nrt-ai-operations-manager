'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FinanceIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/finance/accounts');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs font-mono">
      <span>Redirecting to Chart of Accounts...</span>
    </div>
  );
}
