'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MasterDataIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/master-data/products');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs font-mono">
      <span>Redirecting to Products Master Data...</span>
    </div>
  );
}
