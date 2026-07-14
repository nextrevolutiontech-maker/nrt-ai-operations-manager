'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseService } from '../../../services/inventory';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { PageHeader } from '../../../components/shared/PageHeader';
import { AppTable, ColumnDef } from '../../../components/tables/AppTable';
import { WarehouseForm, WarehouseFormData } from '../../../components/forms/WarehouseForm';
import { Pencil, Trash2, Plus, MapPin } from 'lucide-react';

export default function WarehousesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehouseService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: WarehouseFormData) => warehouseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setIsFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: WarehouseFormData }) => 
      warehouseService.update(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setIsFormOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => warehouseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });

  const handleOpenForm = (warehouse?: any) => {
    setEditingWarehouse(warehouse || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingWarehouse(null);
  };

  const onSubmitForm = async (formData: WarehouseFormData) => {
    if (editingWarehouse) {
      await updateMutation.mutateAsync({ id: editingWarehouse.id, payload: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const columns: ColumnDef[] = [
    { key: 'name', label: 'Warehouse Name' },
    { 
      key: 'location', 
      label: 'Location',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-slate-600">
          <MapPin className="w-4 h-4 text-slate-400" />
          {row.location || 'Not specified'}
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => (
        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
          {row.status || 'ACTIVE'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleOpenForm(row)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this warehouse?')) {
                deleteMutation.mutate(row.id);
              }
            }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <PageHeader 
        title="Warehouses" 
        description="Manage your physical storage locations and branches"
        action={
          <button 
            onClick={() => handleOpenForm()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Warehouse
          </button>
        }
      />
      
      <div className="mt-6">
        <AppTable 
          columns={columns} 
          data={data?.data || []} 
          isLoading={isLoading}
        />
      </div>

      <WarehouseForm 
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={onSubmitForm}
        initialData={editingWarehouse}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </DashboardLayout>
  );
}
