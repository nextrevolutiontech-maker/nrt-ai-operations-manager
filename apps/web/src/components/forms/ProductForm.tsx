import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '../shared/FormInput';
import { Modal } from '../shared/Modal';
import { Loader2 } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  unitId: z.string().min(1, 'Unit is required'),
  price: z.any().transform(val => Number(val) || 0),
  cost: z.any().transform(val => Number(val) || 0),
  minStockLevel: z.any().transform(val => Number(val) || 0),
  maxStockLevel: z.any().transform(val => val ? Number(val) : undefined).optional(),
  reorderLevel: z.any().transform(val => Number(val) || 0),
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  initialData?: ProductFormData;
  isLoading?: boolean;
  categories: any[];
  brands: any[];
  units: any[];
}

export function ProductForm({ 
  isOpen, onClose, onSubmit, initialData, isLoading, categories, brands, units 
}: ProductFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || { price: 0, cost: 0, minStockLevel: 0, reorderLevel: 0 }
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialData || { price: 0, cost: 0, minStockLevel: 0, reorderLevel: 0 });
    }
  }, [isOpen, initialData, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Product" : "Add New Product"}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Product Name" registration={register('name')} error={errors.name?.message} required />
            <FormInput label="SKU (Auto-generated if empty)" registration={register('sku')} error={errors.sku?.message} />
            <FormInput label="Barcode" registration={register('barcode')} error={errors.barcode?.message} />
          </div>
          <div className="space-y-1.5 w-full">
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              {...register('description')} rows={2}
              className="block w-full px-3 py-2 border border-slate-200 rounded-xl shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Classification Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2">Classification</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Category</label>
              <select {...register('categoryId')} className="block w-full px-3 py-2 border rounded-xl text-sm border-slate-200 focus:ring-blue-500">
                <option value="">Select Category...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Brand</label>
              <select {...register('brandId')} className="block w-full px-3 py-2 border rounded-xl text-sm border-slate-200 focus:ring-blue-500">
                <option value="">Select Brand...</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Unit *</label>
              <select {...register('unitId')} className={`block w-full px-3 py-2 border rounded-xl text-sm ${errors.unitId ? 'border-red-300' : 'border-slate-200'} focus:ring-blue-500`}>
                <option value="">Select Unit...</option>
                {units.map(u => <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>)}
              </select>
              {errors.unitId && <p className="text-sm text-red-600">{errors.unitId.message}</p>}
            </div>
          </div>
        </div>

        {/* Pricing & Stock Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2">Pricing & Inventory</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Selling Price" type="number" step="0.01" registration={register('price')} error={errors.price?.message} required />
            <FormInput label="Cost Price" type="number" step="0.01" registration={register('cost')} error={errors.cost?.message} required />
            <FormInput label="Min Stock Level" type="number" registration={register('minStockLevel')} error={errors.minStockLevel?.message} />
            <FormInput label="Reorder Level" type="number" registration={register('reorderLevel')} error={errors.reorderLevel?.message} />
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-3 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70">
            {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
