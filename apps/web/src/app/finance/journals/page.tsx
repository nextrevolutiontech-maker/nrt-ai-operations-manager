'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { journalService, accountService } from '../../../services/finance';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { PageHeader } from '../../../components/shared/PageHeader';
import { AppTable, ColumnDef } from '../../../components/tables/AppTable';
import { JournalForm, JournalFormData } from '../../../components/forms/JournalForm';
import { Plus, Receipt, CheckCircle2 } from 'lucide-react';

export default function JournalsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: journalsData, isLoading: isLoadingJournals } = useQuery({
    queryKey: ['journals'],
    queryFn: () => journalService.getAll(),
  });

  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: JournalFormData) => journalService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      setIsFormOpen(false);
    },
  });

  const onSubmitForm = async (formData: JournalFormData) => {
    // Format payload for backend expectations
    const payload = {
      date: formData.date,
      reference: formData.reference,
      description: formData.description,
      entries: formData.entries.map(e => ({
        accountId: e.accountId,
        debit: Number(e.debit) || 0,
        credit: Number(e.credit) || 0,
        description: e.description || formData.description,
      }))
    };
    await createMutation.mutateAsync(payload as any);
  };

  const columns: ColumnDef[] = [
    { 
      key: 'date', 
      label: 'Date',
      render: (row) => new Date(row.date).toLocaleDateString()
    },
    { 
      key: 'reference', 
      label: 'Reference',
      render: (row) => row.reference || '-'
    },
    { 
      key: 'description', 
      label: 'Description',
      render: (row) => <span className="font-medium text-slate-800">{row.description}</span>
    },
    { 
      key: 'totalDebit', 
      label: 'Total Amount',
      render: (row) => {
        // Calculate total amount from entries
        const total = row.entries?.reduce((sum: number, entry: any) => sum + (Number(entry.debit) || 0), 0) || 0;
        return <span className="font-semibold text-slate-700">{total.toFixed(2)}</span>;
      }
    },
    { 
      key: 'status', 
      label: 'Status',
      render: () => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5" /> Posted
        </span>
      )
    }
  ];

  // Expandable row configuration to show journal entry details
  const expandableConfig = {
    render: (row: any) => (
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Journal Lines</h4>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Account</th>
                <th className="px-4 py-2 text-left font-medium">Description</th>
                <th className="px-4 py-2 text-right font-medium">Debit</th>
                <th className="px-4 py-2 text-right font-medium">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {row.entries?.map((entry: any, i: number) => (
                <tr key={i}>
                  <td className="px-4 py-2">
                    <span className="font-mono text-xs text-slate-500 mr-2">{entry.account?.code}</span>
                    {entry.account?.name}
                  </td>
                  <td className="px-4 py-2 text-slate-600">{entry.description || '-'}</td>
                  <td className="px-4 py-2 text-right">{entry.debit > 0 ? entry.debit.toFixed(2) : '-'}</td>
                  <td className="px-4 py-2 text-right">{entry.credit > 0 ? entry.credit.toFixed(2) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  };

  return (
    <DashboardLayout>
      <PageHeader 
        title="General Journal" 
        description="Record and view manual double-entry accounting journals"
        action={
          <button 
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Journal Entry
          </button>
        }
      />
      
      <div className="mt-6">
        <AppTable 
          columns={columns} 
          data={journalsData?.data || []} 
          isLoading={isLoadingJournals}
          expandable={expandableConfig}
        />
      </div>

      <JournalForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={onSubmitForm}
        isLoading={createMutation.isPending}
        accounts={accountsData?.data || []}
      />
    </DashboardLayout>
  );
}
