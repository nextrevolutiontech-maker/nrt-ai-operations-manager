import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '../shared/FormInput';
import { Modal } from '../shared/Modal';
import { Loader2 } from 'lucide-react';

const unitSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  symbol: z.string().min(1, 'Symbol is required (e.g. kg, pcs)'),
  description: z.string().optional(),
});

export type UnitFormData = z.infer<typeof unitSchema>;

interface UnitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UnitFormData) => Promise<void>;
  initialData?: UnitFormData;
  isLoading?: boolean;
}

export function UnitForm({ isOpen, onClose, onSubmit, initialData, isLoading }: UnitFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: initialData || { name: '', symbol: '', description: '' }
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialData || { name: '', symbol: '', description: '' });
    }
  }, [isOpen, initialData, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Unit" : "Add New Unit"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Unit Name"
            placeholder="e.g. Kilogram"
            registration={register('name')}
            error={errors.name?.message}
            required
          />
          <FormInput
            label="Symbol"
            placeholder="e.g. kg"
            registration={register('symbol')}
            error={errors.symbol?.message}
            required
          />
        </div>

        <div className="space-y-1.5 w-full">
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Optional description..."
            className="block w-full px-3 py-2 border border-slate-200 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-300 transition-all resize-none"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3">
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
              'Save Unit'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
