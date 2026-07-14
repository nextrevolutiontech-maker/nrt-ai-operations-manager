'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { unitService } from '../../../services/master-data';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { PageHeader } from '../../../components/shared/PageHeader';
import { AppTable, ColumnDef } from '../../../components/tables/AppTable';
import { UnitForm, UnitFormData } from '../../../components/forms/UnitForm';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function UnitsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['units'],
    queryFn: () => unitService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: UnitFormData) => unitService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setIsFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: UnitFormData }) => 
      unitService.update(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setIsFormOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => unitService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });

  const handleOpenForm = (unit?: any) => {
    setEditingUnit(unit || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUnit(null);
  };

  const onSubmitForm = async (formData: UnitFormData) => {
    if (editingUnit) {
      await updateMutation.mutateAsync({ id: editingUnit.id, payload: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const columns: ColumnDef[] = [
    { key: 'name', label: 'Name' },
    { key: 'symbol', label: 'Symbol' },
    { key: 'description', label: 'Description' },
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
              if (window.confirm('Are you sure you want to delete this unit?')) {
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
        title="Units of Measurement" 
        description="Manage product measuring units (e.g., kg, liter, pieces)"
        action={
          <button 
            onClick={() => handleOpenForm()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Unit
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

      <UnitForm 
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={onSubmitForm}
        initialData={editingUnit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </DashboardLayout>
  );
}
