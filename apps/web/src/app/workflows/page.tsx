'use client';

import React from 'react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { AppTable, ColumnDef } from '../../components/tables/AppTable';
import { Button } from '../../components/shared/Button';
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowService, Workflow } from '../../services/workflows';

export default function WorkflowsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowService.getAll(),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => workflowService.activate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => workflowService.deactivate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  });

  const columns: ColumnDef<Workflow>[] = [
    {
      label: 'Name',
      key: 'name',
    },
    {
      label: 'Entity Type',
      key: 'entityType',
      render: (workflow) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {workflow.entityType}
        </span>
      ),
    },
    {
      label: 'Amount Range',
      key: 'id', // dummy
      render: (workflow) => {
        if (!workflow.minAmount && !workflow.maxAmount) return 'Any Amount';
        return `${workflow.minAmount || 0} - ${workflow.maxAmount || '∞'}`;
      },
    },
    {
      label: 'Status',
      key: 'isActive',
      render: (workflow) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            workflow.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {workflow.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          {workflow.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      label: 'Actions',
      key: 'id',
      render: (workflow) => (
        <div className="flex gap-2">
          {workflow.isActive ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => deactivateMutation.mutate(workflow.id)}
              disabled={deactivateMutation.isPending}
              className="text-red-600 hover:bg-red-50"
            >
              Deactivate
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => activateMutation.mutate(workflow.id)}
              disabled={activateMutation.isPending}
              className="text-green-600 hover:bg-green-50"
            >
              Activate
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
          <p className="text-gray-500 mt-1">Manage approval workflows for different entities.</p>
        </div>
        <Link href="/workflows/create">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Workflow
          </Button>
        </Link>
      </div>

      <AppTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
      />
    </DashboardLayout>
  );
}
