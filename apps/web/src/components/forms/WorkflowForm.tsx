'use client';

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Plus, Trash2 } from 'lucide-react';
import { workflowService, CreateWorkflowDto, UpdateWorkflowDto } from '../../services/workflows';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

const workflowSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  entityType: z.string().min(2, 'Entity Type is required'),
  minAmount: z.coerce.number().optional().nullable(),
  maxAmount: z.coerce.number().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  levels: z.array(
    z.object({
      sequence: z.coerce.number(),
      roleId: z.string().optional(),
      userId: z.string().optional(),
    }).refine(data => data.roleId || data.userId, {
      message: 'Either Role ID or User ID must be provided',
      path: ['userId'],
    })
  ).min(1, 'At least one approval level is required'),
});

type WorkflowFormData = z.infer<typeof workflowSchema>;

interface WorkflowFormProps {
  initialData?: any;
}

export function WorkflowForm({ initialData }: WorkflowFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkflowFormData>({
    resolver: zodResolver(workflowSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      entityType: initialData?.entityType || 'PURCHASE_ORDER',
      minAmount: initialData?.minAmount,
      maxAmount: initialData?.maxAmount,
      isActive: initialData?.isActive ?? true,
      levels: initialData?.levels || [{ sequence: 1, userId: '', roleId: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'levels',
  });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      // Clean up empty strings before sending
      const payload = {
        ...data,
        levels: data.levels.map((l: any) => ({
          sequence: l.sequence,
          ...(l.roleId ? { roleId: l.roleId } : {}),
          ...(l.userId ? { userId: l.userId } : {}),
        }))
      };

      if (initialData?.id) {
        return workflowService.update(initialData.id, payload as UpdateWorkflowDto);
      }
      return workflowService.create(payload as CreateWorkflowDto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      router.push('/workflows');
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Workflow Name"
          {...register('name')}
          error={errors.name?.message}
          placeholder="e.g., High Value Purchase Orders"
        />

        <Input
          label="Entity Type"
          {...register('entityType')}
          error={errors.entityType?.message}
          placeholder="e.g., PURCHASE_ORDER, SALES_ORDER"
        />

        <div className="md:col-span-2">
          <Input
            label="Description"
            {...register('description')}
            error={errors.description?.message}
          />
        </div>

        <Input
          type="number"
          step="0.01"
          label="Minimum Amount (Optional)"
          {...register('minAmount')}
          error={errors.minAmount?.message}
        />

        <Input
          type="number"
          step="0.01"
          label="Maximum Amount (Optional)"
          {...register('maxAmount')}
          error={errors.maxAmount?.message}
        />
      </div>

      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Approval Levels</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ sequence: fields.length + 1, userId: '', roleId: '' })}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Level
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg">
              <div className="w-24">
                <Input
                  type="number"
                  label="Sequence"
                  {...register(`levels.${index}.sequence` as const)}
                  error={errors.levels?.[index]?.sequence?.message}
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Approver User ID"
                  {...register(`levels.${index}.userId` as const)}
                  error={errors.levels?.[index]?.userId?.message}
                  placeholder="UUID of user"
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Approver Role ID"
                  {...register(`levels.${index}.roleId` as const)}
                  error={errors.levels?.[index]?.roleId?.message}
                  placeholder="UUID of role (optional)"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => remove(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {errors.levels?.root?.message && (
            <p className="text-sm text-red-500">{errors.levels.root.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={mutation.isPending}
        >
          {initialData ? 'Update Workflow' : 'Create Workflow'}
        </Button>
      </div>
    </form>
  );
}
