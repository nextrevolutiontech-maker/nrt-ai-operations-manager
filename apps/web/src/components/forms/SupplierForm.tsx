import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '../shared/FormInput';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';

const supplierSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  contactPerson: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  taxNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierFormData) => void;
  initialData?: any;
  isLoading?: boolean;
}

export function SupplierForm({ isOpen, onClose, onSubmit, initialData, isLoading }: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: initialData || {},
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        name: '', contactPerson: '', email: '', phone: '', mobile: '', taxNumber: '', address: '', city: '', country: '', notes: ''
      });
    }
  }, [initialData, reset, isOpen]);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={initialData ? 'Edit Supplier' : 'Add New Supplier'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Supplier Name"
            registration={register('name')}
            error={errors.name?.message}
            required
          />
          <FormInput
            label="Contact Person"
            registration={register('contactPerson')}
            error={errors.contactPerson?.message}
          />
          <FormInput
            label="Email"
            type="email"
            registration={register('email')}
            error={errors.email?.message}
          />
          <FormInput
            label="Phone"
            registration={register('phone')}
            error={errors.phone?.message}
          />
          <FormInput
            label="Mobile"
            registration={register('mobile')}
            error={errors.mobile?.message}
          />
          <FormInput
            label="Tax Number"
            registration={register('taxNumber')}
            error={errors.taxNumber?.message}
          />
          <FormInput
            label="City"
            registration={register('city')}
            error={errors.city?.message}
          />
          <FormInput
            label="Country"
            registration={register('country')}
            error={errors.country?.message}
          />
          <div className="md:col-span-2">
            <FormInput
              label="Address"
              registration={register('address')}
              error={errors.address?.message}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              {...register('notes')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {initialData ? 'Update Supplier' : 'Create Supplier'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
