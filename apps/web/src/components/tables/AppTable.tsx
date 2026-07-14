'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export interface ColumnDef<T = any> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface AppTableProps {
  columns: ColumnDef[];
  data: any[];
  isLoading?: boolean;
  expandable?: {
    render: (row: any) => React.ReactNode;
  };
}

export function AppTable({ columns, data, isLoading, expandable }: AppTableProps) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p>Loading records...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 border border-slate-100 rounded-xl bg-slate-50 flex flex-col items-center justify-center">
        <p className="text-lg font-medium text-slate-700">No records found</p>
        <p className="text-sm mt-1">Get started by creating a new entry.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {expandable && <th className="px-4 py-4 w-10"></th>}
            {columns.map(col => (
              <th key={col.key} className="px-6 py-4 font-semibold text-slate-700 tracking-wide uppercase text-xs">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, i) => {
            const rowId = row.id || i.toString();
            const isExpanded = !!expandedRows[rowId];

            return (
              <React.Fragment key={rowId}>
                <tr 
                  className={`hover:bg-slate-50/80 transition-colors group ${expandable ? 'cursor-pointer' : ''}`}
                  onClick={() => expandable && toggleRow(rowId)}
                >
                  {expandable && (
                    <td className="px-4 py-4 text-slate-400">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </td>
                  )}
                  {columns.map(col => (
                    <td key={col.key} className="px-6 py-4 text-slate-700 whitespace-nowrap">
                      {col.render 
                        ? col.render(row) 
                        : (row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '-')}
                    </td>
                  ))}
                </tr>
                {expandable && isExpanded && (
                  <tr>
                    <td colSpan={columns.length + 1} className="p-0 border-t border-slate-100">
                      {expandable.render(row)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
