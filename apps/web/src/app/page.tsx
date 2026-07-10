import { DashboardLayout } from '../components/layouts/DashboardLayout';

export default function Home() {
  return (
    <DashboardLayout>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* KPI Cards Placeholder */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-10 h-10 mb-4 bg-gray-100 rounded-lg"></div>
            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 w-16 bg-gray-800 rounded"></div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                <div>
                  <div className="h-4 w-48 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 w-24 bg-gray-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
          <h2 className="text-lg font-semibold mb-4">Pending Approvals</h2>
          <div className="flex items-center justify-center h-[300px] text-gray-400">
            No pending approvals
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
