'use client';

import React from 'react';

interface AppTableProps {
  columns: { key: string; label: string }[];
  data: any[];
  isLoading?: boolean;
}

export function AppTable({ columns, data, isLoading }: AppTableProps) {
  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading data...</div>;
  }

  if (data.length === 0) {
    return <div className="p-8 text-center text-gray-500 border rounded-lg bg-gray-50">No records found.</div>;
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="px-6 py-3 font-medium text-gray-900">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="px-6 py-4 text-gray-700">
                  {row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
