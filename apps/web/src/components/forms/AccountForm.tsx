import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '../shared/FormInput';
import { Modal } from '../shared/Modal';
import { Loader2 } from 'lucide-react';

const accountSchema = z.object({
  code: z.string().min(1, 'Account Code is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']),
  description: z.string().optional(),
});

export type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AccountFormData) => Promise<void>;
  initialData?: AccountFormData;
  isLoading?: boolean;
}

export function AccountForm({ isOpen, onClose, onSubmit, initialData, isLoading }: AccountFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: initialData || { code: '', name: '', type: 'ASSET', description: '' }
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialData || { code: '', name: '', type: 'ASSET', description: '' });
    }
  }, [isOpen, initialData, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Ledger Account" : "Create Ledger Account"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <FormInput
              label="Code"
              placeholder="e.g. 1001"
              registration={register('code')}
              error={errors.code?.message}
              required
            />
          </div>
          <div className="col-span-2">
            <FormInput
              label="Account Name"
              placeholder="e.g. Cash in Bank"
              registration={register('name')}
              error={errors.name?.message}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5 w-full">
          <label className="block text-sm font-medium text-slate-700">Account Type</label>
          <select 
            {...register('type')} 
            className="block w-full px-3 py-2.5 border rounded-xl text-sm border-slate-200 focus:ring-blue-500 font-medium"
          >
            <option value="ASSET">Asset (Balance Sheet)</option>
            <option value="LIABILITY">Liability (Balance Sheet)</option>
            <option value="EQUITY">Equity (Balance Sheet)</option>
            <option value="REVENUE">Revenue (Income Statement)</option>
            <option value="EXPENSE">Expense (Income Statement)</option>
          </select>
        </div>

        <div className="space-y-1.5 w-full">
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea
            {...register('description')}
            rows={2}
            placeholder="Account purpose..."
            className="block w-full px-3 py-2 border border-slate-200 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-300 transition-all resize-none"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Account'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
