'use client';

import React from 'react';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { WorkflowForm } from '../../../components/forms/WorkflowForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateWorkflowPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <Link href="/workflows" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Workflows
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Workflow</h1>
        <p className="text-gray-500 mt-1">Define approval rules and sequence.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <WorkflowForm />
      </div>
    </DashboardLayout>
  );
}
