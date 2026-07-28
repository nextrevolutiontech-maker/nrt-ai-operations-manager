'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InventoryIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/inventory/stock');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs font-mono">
      <span>Redirecting to Inventory Stock View...</span>
    </div>
  );
}
