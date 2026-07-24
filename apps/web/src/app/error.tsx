'use client';

import { AlertTriangle } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/50 min-h-[400px] rounded-3xl border border-dashed border-slate-200">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
        <p className="text-sm text-slate-500 mb-6">
          This section of the dashboard failed to load.
        </p>
        <button
          onClick={() => reset()}
          className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors shadow-md"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
