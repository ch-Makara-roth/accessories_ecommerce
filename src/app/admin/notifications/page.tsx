
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, AlertTriangle, ShoppingBag, UserPlus, Settings2, Loader2 } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { AdminNotification as AdminNotificationType } from '@/types';
import { format } from 'date-fns';

const notificationIcons: { [key: string]: React.ElementType } = {
  Orders: ShoppingBag,
  Inventory: AlertTriangle,
  Users: UserPlus,
  System: Settings2,
  Default: Bell,
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotificationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/notifications');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch notifications' }));
        throw new Error(errorData.error);
      }
      const data: AdminNotificationType[] = await response.json();
      setNotifications(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast({ variant: 'destructive', title: 'Error Loading Notifications', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">Loading notifications...</p>
        </div>
      );
    }
    if (error) {
      return <p className="text-destructive text-center py-4">Error: {error}</p>;
    }
    if (notifications.length === 0) {
      return <p className="text-muted-foreground text-center py-4">No notifications yet.</p>;
    }

    return notifications.map((notification) => {
      const IconComponent = notificationIcons[notification.category] || notificationIcons.Default;
      return (
        <Card 
          key={notification.id} 
          className={`shadow-sm hover:shadow-md transition-shadow rounded-lg ${
            !notification.isRead ? 'border-primary/50 bg-primary/5 dark:bg-primary/10' : 'bg-card'
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <IconComponent 
                  className={`mr-3 h-5 w-5 ${
                    !notification.isRead ? 'text-primary' : 'text-muted-foreground'
                  }`} 
                />
                <CardTitle className={`text-lg ${!notification.isRead ? 'text-primary' : 'text-card-foreground'}`}>
                  {notification.title}
                </CardTitle>
              </div>
              <span className={`text-xs whitespace-nowrap ${!notification.isRead ? 'text-primary/90' : 'text-muted-foreground'}`}>
                {notification.createdAt ? format(new Date(notification.createdAt), 'PPpp') : 'N/A'}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className={`${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
              {notification.description}
            </CardDescription>
             <div className="mt-3 text-xs">
                <span className={`px-2 py-0.5 rounded-full font-medium border ${
                  !notification.isRead 
                    ? (notification.category === 'Orders' ? 'bg-blue-500/20 border-blue-400 text-blue-100' 
                      : notification.category === 'Inventory' ? 'bg-yellow-500/20 border-yellow-400 text-yellow-100'
                      : notification.category === 'Users' ? 'bg-green-500/20 border-green-400 text-green-100'
                      : 'bg-gray-500/20 border-gray-400 text-gray-100')
                    : (notification.category === 'Orders' ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/50 dark:border-blue-700 dark:text-blue-300' 
                      : notification.category === 'Inventory' ? 'bg-yellow-100 border-yellow-300 text-yellow-700 dark:bg-yellow-900/50 dark:border-yellow-700 dark:text-yellow-300'
                      : notification.category === 'Users' ? 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900/50 dark:border-green-700 dark:text-green-300'
                      : 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-300')
                }`}>
                    {notification.category}
                </span>
            </div>
          </CardContent>
        </Card>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground flex items-center">
          <Bell className="mr-3 h-7 w-7 text-primary" />
          Notifications
        </h1>
        {!isLoading && !error && (
          <span className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'No unread notifications'}
          </span>
        )}
      </div>
      <div className="space-y-4">
        {renderContent()}
      </div>
    </div>
  );
}
