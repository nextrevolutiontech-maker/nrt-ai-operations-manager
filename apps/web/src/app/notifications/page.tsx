'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { PageHeader } from '../../components/shared/PageHeader';
import { notificationsService } from '../../services/notifications';
import { Bell, CheckCircle, AlertTriangle, Info, CheckCheck } from 'lucide-react';
import { Button } from '../../components/shared/Button';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data: notifData, isLoading } = useQuery({ 
    queryKey: ['notifications'], 
    queryFn: () => notificationsService.getAll() 
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const notifications = notifData?.data || [];

  const getIcon = (type: string) => {
    switch(type) {
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBg = (type: string) => {
    switch(type) {
      case 'WARNING': return 'bg-amber-100';
      case 'SUCCESS': return 'bg-emerald-100';
      default: return 'bg-blue-100';
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-end mb-6">
        <PageHeader 
          title="Notifications" 
          description="View system alerts, stock warnings, and approval updates."
        />
        {notifications.some((n: any) => !n.isRead) && (
          <Button 
            variant="outline" 
            onClick={() => markAllReadMutation.mutate()}
            isLoading={markAllReadMutation.isPending}
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-w-4xl">
        {isLoading ? (
          <div className="p-8 flex justify-center text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No notifications yet</h3>
            <p className="text-slate-500 max-w-md">You're all caught up! System alerts will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notif: any) => (
              <div 
                key={notif.id} 
                className={`p-6 flex items-start gap-4 transition-colors ${!notif.isRead ? 'bg-blue-50/30' : 'bg-white hover:bg-slate-50'}`}
              >
                <div className={`p-3 rounded-full shrink-0 ${getBg(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-base ${!notif.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className={`text-sm ${!notif.isRead ? 'text-slate-600' : 'text-slate-500'}`}>
                    {notif.message}
                  </p>
                </div>

                {!notif.isRead && (
                  <button 
                    onClick={() => markReadMutation.mutate(notif.id)}
                    disabled={markReadMutation.isPending}
                    className="w-3 h-3 rounded-full bg-blue-500 mt-2 shrink-0 hover:bg-blue-600 transition-colors"
                    title="Mark as read"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
