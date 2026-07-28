'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SalesIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/sales/orders');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs font-mono">
      <span>Redirecting to Sales Orders...</span>
    </div>
  );
}
