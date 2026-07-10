'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { PageHeader } from '../../../components/shared/PageHeader';
import { AppTable } from '../../../components/tables/AppTable';

export default function CategoriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    },
  });

  const columns = [
    { key: 'categoryCode', label: 'Code' },
    { key: 'categoryName', label: 'Name' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <DashboardLayout>
      <PageHeader 
        title="Categories" 
        description="Manage product categories"
        action={
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
            Add Category
          </button>
        }
      />
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <AppTable 
          columns={columns} 
          data={data?.data || []} 
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
}
