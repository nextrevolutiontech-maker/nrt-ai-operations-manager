'use client';

import { ShieldAlert } from 'lucide-react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 mb-2">System Error Detected</h1>
            <p className="text-slate-500 mb-8 leading-relaxed">
              A critical error occurred in the application. Our automated systems have logged this issue.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => reset()}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-slate-900/20"
              >
                Try to Recover
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full py-3 px-4 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-slate-900 rounded-xl text-left overflow-auto max-h-48">
                <p className="text-red-400 font-mono text-xs mb-2">Error Details (Dev Only):</p>
                <p className="text-slate-300 font-mono text-[10px] break-words">
                  {error.message || 'Unknown error'}
                  {error.stack}
                </p>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
