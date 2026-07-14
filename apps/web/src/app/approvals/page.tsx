'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { AppTable, ColumnDef } from '../../components/tables/AppTable';
import { Button } from '../../components/shared/Button';
import { ClipboardList, CheckCircle, XCircle, ArrowLeftRight, Clock, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { approvalService, ApprovalRequest } from '../../services/approvals';
import { ApprovalActionModal } from '../../components/forms/ApprovalActionModal';
import { Input } from '../../components/shared/Input';

export default function ApprovalsPage() {
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['approvals'],
    queryFn: () => approvalService.getAll(),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3.5 h-3.5" /> Pending</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
      case 'RETURNED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"><ArrowLeftRight className="w-3.5 h-3.5" /> Returned</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const filteredData = data?.data?.filter(item => 
    item.entityRef?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.entityType.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const columns: ColumnDef<ApprovalRequest>[] = [
    {
      label: 'Reference',
      key: 'entityRef',
      render: (req) => <span className="font-medium text-gray-900">{req.entityRef || req.entityId.slice(0, 8)}</span>,
    },
    {
      label: 'Type',
      key: 'entityType',
      render: (req) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {req.entityType}
        </span>
      ),
    },
    {
      label: 'Requester',
      key: 'requesterId',
      render: (req) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {req.requester ? `${req.requester.firstName} ${req.requester.lastName}` : req.requesterId.slice(0, 8)}
          </span>
          <span className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      label: 'Status',
      key: 'status',
      render: (req) => getStatusBadge(req.status),
    },
    {
      label: 'Actions',
      key: 'id',
      render: (req) => (
        <div className="flex gap-2">
          {req.status === 'PENDING' && (
            <Button
              size="sm"
              onClick={() => setSelectedRequest(req)}
              className="bg-primary hover:bg-primary-dark"
            >
              Review
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" />
            Pending Approvals
          </h1>
          <p className="text-gray-500 mt-1">Review and process requests requiring your attention.</p>
        </div>
        <div className="w-72">
          <Input
            placeholder="Search by reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4 text-gray-400" />}
          />
        </div>
      </div>

      <AppTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
      />

      <ApprovalActionModal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        requestId={selectedRequest?.id || ''}
        entityRef={selectedRequest?.entityRef}
      />
    </DashboardLayout>
  );
}
