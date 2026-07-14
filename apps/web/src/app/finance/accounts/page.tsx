'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountService } from '../../../services/finance';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { PageHeader } from '../../../components/shared/PageHeader';
import { AppTable, ColumnDef } from '../../../components/tables/AppTable';
import { AccountForm, AccountFormData } from '../../../components/forms/AccountForm';
import { Pencil, Plus, Wallet, TrendingDown, BookOpen, Briefcase, Landmark } from 'lucide-react';

export default function ChartOfAccountsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: AccountFormData) => accountService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setIsFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: AccountFormData }) => 
      accountService.update(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setIsFormOpen(false);
    },
  });

  const handleOpenForm = (account?: any) => {
    setEditingAccount(account || null);
    setIsFormOpen(true);
  };

  const onSubmitForm = async (formData: AccountFormData) => {
    if (editingAccount) {
      await updateMutation.mutateAsync({ id: editingAccount.id, payload: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const getAccountTypeInfo = (type: string) => {
    switch (type) {
      case 'ASSET': return { icon: Landmark, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'LIABILITY': return { icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-100' };
      case 'EQUITY': return { icon: Wallet, color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'REVENUE': return { icon: TrendingDown, color: 'text-emerald-600', bg: 'bg-emerald-100' };
      case 'EXPENSE': return { icon: BookOpen, color: 'text-red-600', bg: 'bg-red-100' };
      default: return { icon: Landmark, color: 'text-slate-600', bg: 'bg-slate-100' };
    }
  };

  const columns: ColumnDef[] = [
    { 
      key: 'code', 
      label: 'Account Code',
      render: (row) => <span className="font-mono text-slate-600">{row.code}</span>
    },
    { 
      key: 'name', 
      label: 'Account Name',
      render: (row) => <span className="font-medium text-slate-900">{row.name}</span>
    },
    { 
      key: 'type', 
      label: 'Type',
      render: (row) => {
        const info = getAccountTypeInfo(row.type);
        const Icon = info.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${info.bg} ${info.color}`}>
            <Icon className="w-3.5 h-3.5" />
            {row.type}
          </span>
        );
      }
    },
    { key: 'description', label: 'Description', render: (row) => row.description || '-' },
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
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <PageHeader 
        title="Chart of Accounts" 
        description="Manage your ledger accounts (Assets, Liabilities, Equity, Revenue, Expenses)"
        action={
          <button 
            onClick={() => handleOpenForm()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Account
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

      <AccountForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={onSubmitForm}
        initialData={editingAccount}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </DashboardLayout>
  );
}
