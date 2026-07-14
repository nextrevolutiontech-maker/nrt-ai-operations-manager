import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '../shared/FormInput';
import { Modal } from '../shared/Modal';
import { Loader2 } from 'lucide-react';

const movementSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  type: z.enum(['IN', 'OUT', 'TRANSFER']),
  quantity: z.any().transform(val => Number(val) || 0),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export type StockMovementFormData = z.infer<typeof movementSchema>;

interface StockMovementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StockMovementFormData) => Promise<void>;
  isLoading?: boolean;
  products: any[];
  warehouses: any[];
}

export function StockMovementForm({ 
  isOpen, onClose, onSubmit, isLoading, products, warehouses 
}: StockMovementFormProps) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<StockMovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: { type: 'IN', quantity: 1 }
  });

  const movementType = watch('type');

  useEffect(() => {
    if (isOpen) {
      reset({ type: 'IN', quantity: 1 });
    }
  }, [isOpen, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Stock Movement"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Movement Type</label>
            <select 
              {...register('type')} 
              className="block w-full px-3 py-2.5 border rounded-xl text-sm border-slate-200 focus:ring-blue-500 font-medium"
            >
              <option value="IN">Stock IN (Receive)</option>
              <option value="OUT">Stock OUT (Issue)</option>
            </select>
          </div>
          <FormInput 
            label="Quantity" 
            type="number" 
            registration={register('quantity')} 
            error={errors.quantity?.message} 
            required 
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Product</label>
          <select 
            {...register('productId')} 
            className={`block w-full px-3 py-2.5 border rounded-xl text-sm ${errors.productId ? 'border-red-300' : 'border-slate-200'} focus:ring-blue-500`}
          >
            <option value="">Select Product...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
            ))}
          </select>
          {errors.productId && <p className="text-sm text-red-600">{errors.productId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            {movementType === 'IN' ? 'Receiving Warehouse' : 'Issuing Warehouse'}
          </label>
          <select 
            {...register('warehouseId')} 
            className={`block w-full px-3 py-2.5 border rounded-xl text-sm ${errors.warehouseId ? 'border-red-300' : 'border-slate-200'} focus:ring-blue-500`}
          >
            <option value="">Select Warehouse...</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          {errors.warehouseId && <p className="text-sm text-red-600">{errors.warehouseId.message}</p>}
        </div>

        <FormInput 
          label="Reference / Receipt No." 
          placeholder="e.g. PO-1024 or Manual Adjust" 
          registration={register('reference')} 
          error={errors.reference?.message} 
        />

        <div className="space-y-1.5 w-full">
          <label className="block text-sm font-medium text-slate-700">Notes / Reason</label>
          <textarea
            {...register('notes')}
            rows={2}
            className="block w-full px-3 py-2 border border-slate-200 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-300 transition-all resize-none"
          />
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
            disabled={isLoading}
            className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
              movementType === 'IN' ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
            }`}
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
            ) : (
              movementType === 'IN' ? 'Confirm Receive' : 'Confirm Issue'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
