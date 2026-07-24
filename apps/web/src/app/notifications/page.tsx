'use client';

import React from 'react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { PageHeader } from '../../components/shared/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Bell, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const { data, isLoading } = useQuery({ 
    queryKey: ['notifications'], 
    queryFn: async () => {
      // Create a fallback in case API endpoint is not available
      try {
        const res = await api.get('/notifications');
        return res.data;
      } catch (err) {
        return { data: [] };
      }
    }
  });

  const notifications = data?.data || [];

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'ERROR': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <DashboardLayout>
      <PageHeader 
        title="Notifications Center" 
        description="View your system alerts, workflow updates, and activity logs."
      />

      <div className="mt-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">All Notifications</h2>
            </div>
            <button className="text-sm text-blue-600 font-medium hover:underline">Mark all as read</button>
          </div>

          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-6 flex justify-center">
                <div className="animate-pulse flex items-center gap-2 text-slate-400">
                  <div className="w-4 h-4 bg-slate-300 rounded-full"></div>
                  Loading notifications...
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Bell className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-1">No new notifications</h3>
                <p className="text-sm text-slate-500">You're all caught up! Check back later.</p>
              </div>
            ) : (
              notifications.map((notification: any) => (
                <div key={notification.id} className={`p-5 flex gap-4 transition-colors hover:bg-slate-50 ${!notification.isRead ? 'bg-blue-50/50' : ''}`}>
                  <div className="mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h4 className={`text-sm font-semibold ${!notification.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {notification.message}
                    </p>
                    {notification.module && (
                      <span className="inline-block mt-2 px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-md tracking-wider">
                        {notification.module}
                      </span>
                    )}
                  </div>
                  {!notification.isRead && (
                    <div className="flex items-center">
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
