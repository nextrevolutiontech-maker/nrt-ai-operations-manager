import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '../shared/FormInput';
import { Modal } from '../shared/Modal';
import { Loader2, Plus, Trash2, AlertCircle } from 'lucide-react';

const journalEntrySchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  debit: z.any().transform(val => Number(val) || 0),
  credit: z.any().transform(val => Number(val) || 0),
  description: z.string().optional(),
}).refine(data => {
  return (data.debit > 0 && data.credit === 0) || (data.credit > 0 && data.debit === 0);
}, "Line must have either a debit or credit, but not both or neither.");

const journalSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  reference: z.string().optional(),
  description: z.string().min(1, 'Journal description is required'),
  entries: z.array(journalEntrySchema).min(2, 'At least two entries are required for double-entry bookkeeping'),
}).refine(data => {
  const totalDebit = data.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
  const totalCredit = data.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
  return Math.abs(totalDebit - totalCredit) < 0.001; // Precision check
}, "Total Debits must equal Total Credits");

export type JournalFormData = z.infer<typeof journalSchema>;

interface JournalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: JournalFormData) => Promise<void>;
  isLoading?: boolean;
  accounts: any[];
}

export function JournalForm({ isOpen, onClose, onSubmit, isLoading, accounts }: JournalFormProps) {
  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm<JournalFormData>({
    resolver: zodResolver(journalSchema),
    defaultValues: { 
      date: new Date().toISOString().split('T')[0],
      reference: '',
      description: '',
      entries: [
        { accountId: '', debit: 0, credit: 0, description: '' },
        { accountId: '', debit: 0, credit: 0, description: '' }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries"
  });

  const watchEntries = watch("entries");
  
  const totalDebit = watchEntries.reduce((sum, entry) => sum + (Number(entry.debit) || 0), 0);
  const totalCredit = watchEntries.reduce((sum, entry) => sum + (Number(entry.credit) || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference < 0.001 && totalDebit > 0;

  useEffect(() => {
    if (isOpen) {
      reset({ 
        date: new Date().toISOString().split('T')[0],
        reference: '',
        description: '',
        entries: [
          { accountId: '', debit: 0, credit: 0, description: '' },
          { accountId: '', debit: 0, credit: 0, description: '' }
        ]
      });
    }
  }, [isOpen, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create General Journal"
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Header Section */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <FormInput 
            label="Date" 
            type="date" 
            registration={register('date')} 
            error={errors.date?.message} 
            required 
          />
          <FormInput 
            label="Reference" 
            placeholder="e.g. JRN-2023-01" 
            registration={register('reference')} 
            error={errors.reference?.message} 
          />
          <FormInput 
            label="Description / Memo" 
            placeholder="Overall purpose of entry..." 
            registration={register('description')} 
            error={errors.description?.message} 
            required 
          />
        </div>

        {/* Lines Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-800">Journal Lines</h3>
            <button
              type="button"
              onClick={() => append({ accountId: '', debit: 0, credit: 0, description: '' })}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded"
            >
              <Plus className="w-3 h-3" /> Add Line
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-medium border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 w-1/3">Account</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 w-32">Debit</th>
                  <th className="px-4 py-3 w-32">Credit</th>
                  <th className="px-4 py-3 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fields.map((item, index) => (
                  <tr key={item.id} className="bg-white">
                    <td className="px-4 py-2 align-top">
                      <select 
                        {...register(`entries.${index}.accountId`)}
                        className={`block w-full px-2.5 py-1.5 border rounded-lg text-sm ${errors.entries?.[index]?.accountId ? 'border-red-300' : 'border-slate-200'} focus:ring-blue-500`}
                      >
                        <option value="">Select Account...</option>
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 align-top">
                      <input 
                        {...register(`entries.${index}.description`)}
                        type="text"
                        placeholder="Line description"
                        className="block w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2 align-top">
                      <input 
                        {...register(`entries.${index}.debit`)}
                        type="number"
                        min="0"
                        step="0.01"
                        className={`block w-full px-2.5 py-1.5 border rounded-lg text-sm ${errors.entries?.[index]?.debit ? 'border-red-300' : 'border-slate-200'} focus:ring-blue-500`}
                      />
                    </td>
                    <td className="px-4 py-2 align-top">
                      <input 
                        {...register(`entries.${index}.credit`)}
                        type="number"
                        min="0"
                        step="0.01"
                        className={`block w-full px-2.5 py-1.5 border rounded-lg text-sm ${errors.entries?.[index]?.credit ? 'border-red-300' : 'border-slate-200'} focus:ring-blue-500`}
                      />
                    </td>
                    <td className="px-4 py-2 align-middle text-center">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 2}
                        className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-800">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-right">Totals:</td>
                  <td className="px-4 py-3 text-left ${totalDebit !== totalCredit ? 'text-red-600' : 'text-emerald-600'}">
                    {totalDebit.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-left ${totalDebit !== totalCredit ? 'text-red-600' : 'text-emerald-600'}">
                    {totalCredit.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {/* Validation Messages */}
          {errors.entries?.root && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> {errors.entries.root.message}
            </p>
          )}
          {!isBalanced && totalDebit > 0 && totalCredit > 0 && difference >= 0.001 && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> Out of balance by {difference.toFixed(2)}
            </p>
          )}
          {errors.root && (
             <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
               <AlertCircle className="w-4 h-4" /> {errors.root.message}
             </p>
          )}
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !isBalanced}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting...</>
            ) : (
              'Post Journal'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
