
// src/app/account/notifications/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, Package, PercentCircle } from 'lucide-react';

const mockCustomerNotifications = [
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
];

export default function CustomerNotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground flex items-center">
          <Bell className="mr-3 h-7 w-7 text-primary" />
          My Notifications
        </h1>
        <span className="text-sm text-muted-foreground">
          Showing {mockCustomerNotifications.filter(n => !n.read).length} unread notifications
        </span>
      </div>

      <div className="space-y-4">
        {mockCustomerNotifications.length > 0 ? (
          mockCustomerNotifications.map((notification) => (
            <Card key={notification.id} className={`shadow-sm hover:shadow-md transition-shadow ${!notification.read ? 'border-primary/50 bg-primary/5' : 'bg-card'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <notification.icon className={`mr-3 h-5 w-5 ${!notification.read ? 'text-primary' : 'text-muted-foreground'}`} />
                    <CardTitle className="text-lg">{notification.title}</CardTitle>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{notification.time}</span>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className={`${!notification.read ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                  {notification.description}
                </CardDescription>
                 <div className="mt-3 text-xs">
                    <span className={`px-2 py-0.5 rounded-full text-foreground/80 font-medium border ${
                        notification.category === 'Orders' ? 'bg-blue-100 border-blue-300 text-blue-700' :
                        notification.category === 'Promotions' ? 'bg-purple-100 border-purple-300 text-purple-700' :
                        'bg-gray-100 border-gray-300 text-gray-700'
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
