import Link from 'next/link';
import { SearchX, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-10 text-center">
        <div className="w-24 h-24 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-8 relative">
          <SearchX className="w-12 h-12" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full border-4 border-white flex items-center justify-center text-white font-bold text-xs">
            404
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Page Not Found</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          We couldn't find the page you're looking for. It might have been moved, deleted, or never existed in the first place.
        </p>
        
        <Link 
          href="/"
          className="inline-flex items-center justify-center w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-slate-900/20 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
