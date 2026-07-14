import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '../shared/FormInput';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  contactPerson: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  taxNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  creditLimit: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => void;
  initialData?: any;
  isLoading?: boolean;
}

export function CustomerForm({ isOpen, onClose, onSubmit, initialData, isLoading }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData || {},
  });

  useEffect(() => {
    if (initialData) {
      reset({ ...initialData, creditLimit: Number(initialData.creditLimit) || 0 });
    } else {
      reset({
        name: '', contactPerson: '', email: '', phone: '', mobile: '', taxNumber: '', address: '', city: '', country: '', creditLimit: 0, notes: ''
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
      title={initialData ? 'Edit Customer' : 'Add New Customer'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Customer Name"
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
            label="Credit Limit"
            type="number"
            step="0.01"
            registration={register('creditLimit', { valueAsNumber: true })}
            error={errors.creditLimit?.message}
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
          <div className="md:col-span-2">
            <FormInput
              label="Address"
              registration={register('address')}
              error={errors.address?.message}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {initialData ? 'Update Customer' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
