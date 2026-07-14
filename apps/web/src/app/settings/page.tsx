'use client';

import React, { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { PageHeader } from '../../components/shared/PageHeader';
import { settingsService } from '../../services/settings';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { Building2, Save } from 'lucide-react';

const settingsSchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  taxId: z.string().min(2, 'Tax ID is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is required'),
  address: z.string().min(5, 'Address is required'),
  currency: z.string().min(3, 'Currency is required'),
  timezone: z.string().min(2, 'Timezone is required'),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { data, isLoading } = useQuery({ 
    queryKey: ['settings-company'], 
    queryFn: () => settingsService.getCompanyProfile() 
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    if (data?.data) {
      reset(data.data);
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (payload: SettingsFormData) => settingsService.updateCompanyProfile(payload),
    onSuccess: () => {
      alert('Settings saved successfully!');
    }
  });

  const onSubmit = (formData: SettingsFormData) => {
    mutation.mutate(formData);
  };

  return (
    <DashboardLayout>
      <PageHeader 
        title="System Settings" 
        description="Manage company profile and global system preferences."
      />

      <div className="mt-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Company Profile</h2>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-slate-100 rounded"></div>
                <div className="h-10 bg-slate-100 rounded"></div>
                <div className="h-10 bg-slate-100 rounded"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Company Name" 
                    placeholder="Enter company name"
                    {...register('name')}
                    error={errors.name?.message}
                  />
                  <Input 
                    label="Tax ID / Registration No" 
                    placeholder="e.g. TX-123456"
                    {...register('taxId')}
                    error={errors.taxId?.message}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Email Address" 
                    type="email"
                    placeholder="admin@company.com"
                    {...register('email')}
                    error={errors.email?.message}
                  />
                  <Input 
                    label="Phone Number" 
                    placeholder="+1 (555) 000-0000"
                    {...register('phone')}
                    error={errors.phone?.message}
                  />
                </div>

                <Input 
                  label="Business Address" 
                  placeholder="123 Main St, City, Country"
                  {...register('address')}
                  error={errors.address?.message}
                />

                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 mb-4">Localization Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700">Base Currency</label>
                      <select 
                        {...register('currency')}
                        className="w-full h-11 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="PKR">PKR (Rs)</option>
                      </select>
                      {errors.currency?.message && <p className="text-xs text-red-500">{errors.currency.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700">Timezone</label>
                      <select 
                        {...register('timezone')}
                        className="w-full h-11 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Asia/Dubai">Dubai (GST)</option>
                        <option value="Asia/Karachi">Karachi (PKT)</option>
                      </select>
                      {errors.timezone?.message && <p className="text-xs text-red-500">{errors.timezone.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <Button type="submit" isLoading={mutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
