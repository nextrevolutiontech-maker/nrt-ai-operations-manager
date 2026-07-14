'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { approvalService, ApprovalActionType } from '../../services/approvals';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const actionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'RETURN', 'CANCEL'] as const),
  notes: z.string().optional(),
});

type ActionFormData = z.infer<typeof actionSchema>;

interface ApprovalActionModalProps {
  requestId: string;
  isOpen: boolean;
  onClose: () => void;
  entityRef?: string;
}

export function ApprovalActionModal({ requestId, isOpen, onClose, entityRef }: ApprovalActionModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ActionFormData>({
    resolver: zodResolver(actionSchema),
    defaultValues: {
      action: 'APPROVE',
      notes: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ActionFormData) => approvalService.processAction(requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      reset();
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Process Request</h2>
          <p className="text-sm text-gray-500 mt-1">
            {entityRef ? `Action for ${entityRef}` : 'Process this approval request.'}
          </p>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              {...register('action')}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            >
              <option value="APPROVE">Approve</option>
              <option value="REJECT">Reject</option>
              <option value="RETURN">Return to Requester</option>
              <option value="CANCEL">Cancel Request</option>
            </select>
            {errors.action?.message && (
              <p className="mt-1 text-sm text-red-500">{errors.action.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              {...register('notes')}
              rows={4}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              placeholder="Add your comments here..."
            />
            {errors.notes?.message && (
              <p className="mt-1 text-sm text-red-500">{errors.notes.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={mutation.isPending}
            >
              Confirm Action
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
