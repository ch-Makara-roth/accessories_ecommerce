
// src/app/account/notifications/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, Package, PercentCircle } from 'lucide-react';

// Export mock data so it can be imported by the layout
export const mockCustomerNotifications = [
  {
    id: 'custNotif1',
    icon: Package,
    title: 'Your Order #ORD12345 Has Shipped!',
    description: 'Your order containing Wireless Earbuds is on its way. Expected delivery: Oct 30, 2023.',
    time: '2 hours ago',
    read: false,
    category: 'Orders',
  },
  {
    id: 'custNotif2',
    icon: PercentCircle,
    title: 'Special Discount For You!',
    description: 'Enjoy 15% off your next purchase with code CUSTOMER15. Valid for 7 days.',
    time: 'Yesterday',
    read: true,
    category: 'Promotions',
  },
  {
    id: 'custNotif3',
    icon: Package,
    title: 'Order #ORD12340 Delivered',
    description: 'Your order has been successfully delivered. We hope you enjoy your new items!',
    time: '3 days ago',
    read: true,
    category: 'Orders',
  },
  {
    id: 'custNotif4',
    icon: PercentCircle,
    title: 'Flash Sale on Headphones!',
    description: 'Limited time: Up to 30% off on selected headphones. Ends tonight!',
    time: '4 hours ago',
    read: false,
    category: 'Promotions',
  },
];

export default function CustomerNotificationsPage() {
  const unreadCount = mockCustomerNotifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground flex items-center">
          <Bell className="mr-3 h-7 w-7 text-primary" />
          My Notifications
        </h1>
        {unreadCount > 0 && (
          <span className="text-sm text-muted-foreground">
            You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {mockCustomerNotifications.length > 0 ? (
          mockCustomerNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`shadow-sm hover:shadow-md transition-shadow rounded-lg ${
                !notification.read ? 'border-primary/50 bg-primary/5 dark:bg-primary/10' : 'bg-card'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <notification.icon 
                      className={`mr-3 h-5 w-5 ${
                        !notification.read ? 'text-primary' : 'text-muted-foreground'
                      }`} 
                    />
                    <CardTitle className={`text-lg ${!notification.read ? 'text-primary' : 'text-card-foreground'}`}>
                      {notification.title}
                    </CardTitle>
                  </div>
                  <span className={`text-xs whitespace-nowrap ${!notification.read ? 'text-primary/90' : 'text-muted-foreground'}`}>
                    {notification.time}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className={`${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {notification.description}
                </CardDescription>
                 <div className="mt-3 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-medium border ${
                        !notification.read 
                          ? (notification.category === 'Orders' ? 'bg-blue-500/20 border-blue-400 text-blue-100' 
                            : notification.category === 'Promotions' ? 'bg-purple-500/20 border-purple-400 text-purple-100'
                            : 'bg-gray-500/20 border-gray-400 text-gray-100')
                          : (notification.category === 'Orders' ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/50 dark:border-blue-700 dark:text-blue-300' 
                            : notification.category === 'Promotions' ? 'bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/50 dark:border-purple-700 dark:text-purple-300'
                            : 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-300')
                    }`}>
                        {notification.category}
                    </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">You have no notifications.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
