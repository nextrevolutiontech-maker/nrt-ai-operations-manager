import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '../shared/FormInput';
import { Button } from '../shared/Button';
import { Trash2, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supplierService } from '../../services/procurement';
import { productService } from '../../services/master-data';
import { warehouseService } from '../../services/inventory';

const purchaseItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().min(0.01, 'Must be > 0'),
  unitCost: z.number().min(0, 'Must be >= 0'),
  discount: z.number().min(0).max(100).optional(),
  tax: z.number().min(0).max(100).optional(),
});

const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  orderDate: z.string().min(1, 'Order Date is required'),
  expectedDeliveryDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

interface PurchaseOrderFormProps {
  onSubmit: (data: PurchaseOrderFormData) => void;
  isLoading?: boolean;
}

export function PurchaseOrderForm({ onSubmit, isLoading }: PurchaseOrderFormProps) {
  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => supplierService.getAll({ limit: 100 }),
  });

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehouseService.getAll({ limit: 100 }),
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getAll({ limit: 500 }),
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      orderDate: new Date().toISOString().split('T')[0],
      items: [{ productId: '', quantity: 1, unitCost: 0, discount: 0, tax: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');

  // Calculate totals
  const totalAmount = watchItems?.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const cost = Number(item.unitCost) || 0;
    const disc = Number(item.discount) || 0;
    const tax = Number(item.tax) || 0;
    
    const base = qty * cost;
    const afterDisc = base - (base * (disc / 100));
    const finalPrice = afterDisc + (afterDisc * (tax / 100));
    return sum + finalPrice;
  }, 0) || 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">General Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Supplier *</label>
            <select
              {...register('supplierId')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                errors.supplierId ? 'border-red-500' : 'border-slate-300'
              }`}
            >
              <option value="">Select Supplier</option>
              {suppliers?.items?.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.supplierId && <p className="mt-1 text-sm text-red-500">{errors.supplierId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Receiving Warehouse *</label>
            <select
              {...register('warehouseId')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                errors.warehouseId ? 'border-red-500' : 'border-slate-300'
              }`}
            >
              <option value="">Select Warehouse</option>
              {warehouses?.items?.map((w: any) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            {errors.warehouseId && <p className="mt-1 text-sm text-red-500">{errors.warehouseId.message}</p>}
          </div>

          <FormInput
            label="Order Date *"
            type="date"
            registration={register('orderDate')}
            error={errors.orderDate?.message}
          />

          <FormInput
            label="Expected Delivery"
            type="date"
            registration={register('expectedDeliveryDate')}
            error={errors.expectedDeliveryDate?.message}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Line Items</h2>
          <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', quantity: 1, unitCost: 0, discount: 0, tax: 0 })}>
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-sm">
                <th className="p-3 font-medium text-slate-600">Product *</th>
                <th className="p-3 font-medium text-slate-600 w-32">Qty *</th>
                <th className="p-3 font-medium text-slate-600 w-32">Unit Cost *</th>
                <th className="p-3 font-medium text-slate-600 w-24">Disc %</th>
                <th className="p-3 font-medium text-slate-600 w-24">Tax %</th>
                <th className="p-3 font-medium text-slate-600 text-right w-32">Line Total</th>
                <th className="p-3 font-medium text-slate-600 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const qty = Number(watchItems[index]?.quantity) || 0;
                const cost = Number(watchItems[index]?.unitCost) || 0;
                const disc = Number(watchItems[index]?.discount) || 0;
                const tax = Number(watchItems[index]?.tax) || 0;
                
                const base = qty * cost;
                const afterDisc = base - (base * (disc / 100));
                const lineTotal = afterDisc + (afterDisc * (tax / 100));

                return (
                  <tr key={field.id} className="border-b border-slate-100">
                    <td className="p-2">
                      <select
                        {...register(`items.${index}.productId`)}
                        onChange={(e) => {
                          const pId = e.target.value;
                          const product = products?.items?.find((p: any) => p.id === pId);
                          register(`items.${index}.productId`).onChange(e); // Trigger react-hook-form change
                          if (product) {
                            setValue(`items.${index}.unitCost`, Number(product.cost));
                          }
                        }}
                        className={`w-full px-2 py-1.5 border rounded focus:ring-2 focus:ring-blue-500 bg-white ${
                          errors.items?.[index]?.productId ? 'border-red-500' : 'border-slate-300'
                        }`}
                      >
                        <option value="">Select Product...</option>
                        {products?.items?.map((p: any) => (
                          <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.unitCost`, { valueAsNumber: true })}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.discount`, { valueAsNumber: true })}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.tax`, { valueAsNumber: true })}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-2 text-right font-medium text-slate-700">
                      ${lineTotal.toFixed(2)}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} className="p-3 text-right font-bold text-slate-800">Total Amount:</td>
                <td className="p-3 text-right font-bold text-blue-600 text-lg">${totalAmount.toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          {errors.items?.message && <p className="text-red-500 text-sm mt-2">{errors.items.message}</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Terms</label>
        <textarea
          {...register('notes')}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Enter any internal notes or terms for the supplier..."
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Create Purchase Order
        </Button>
      </div>
    </form>
  );
}
