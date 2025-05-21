
// src/app/admin/notifications/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, AlertTriangle, ShoppingBag, UserPlus, PackageCheck, Settings2 } from 'lucide-react';

const mockNotifications = [
  {
    id: '1',
    icon: AlertTriangle,
    title: 'Low Stock Alert: Wireless Earbuds',
    description: 'Stock for "Wireless Earbuds" (P1) is below 10 units. Current stock: 8.',
    time: '15 minutes ago',
    read: false,
    category: 'Inventory',
  },
  {
    id: '2',
    icon: ShoppingBag,
    title: 'New High-Value Order: #12346',
    description: 'Order #12346 for $587.00 has been placed by Alice Wonderland.',
    time: '1 hour ago',
    read: false,
    category: 'Orders',
  },
  {
    id: '3',
    icon: UserPlus,
    title: 'New Customer Registered',
    description: 'Bob The Builder (bob@example.com) has just signed up.',
    time: '3 hours ago',
    read: true,
    category: 'Users',
  },
  {
    id: '4',
    icon: PackageCheck,
    title: 'Order Shipped: #12342',
    description: 'Order #12342 has been successfully shipped. Tracking: XYZ123ABC.',
    time: 'Yesterday',
    read: true,
    category: 'Orders',
  },
   {
    id: '5',
    icon: Settings2,
    title: 'System Maintenance Scheduled',
    description: 'Scheduled maintenance on Sunday at 2:00 AM UTC. Expect brief downtime.',
    time: '2 days ago',
    read: true,
    category: 'System',
  }
];

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground flex items-center">
          <Bell className="mr-3 h-7 w-7 text-primary" />
          Notifications
        </h1>
        <span className="text-sm text-muted-foreground">
          Showing {mockNotifications.filter(n => !n.read).length} unread notifications
        </span>
      </div>

      <div className="space-y-4">
        {mockNotifications.length > 0 ? (
          mockNotifications.map((notification) => (
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
                        notification.category === 'Inventory' ? 'bg-yellow-100 border-yellow-300 text-yellow-700' :
                        notification.category === 'Orders' ? 'bg-blue-100 border-blue-300 text-blue-700' :
                        notification.category === 'Users' ? 'bg-green-100 border-green-300 text-green-700' :
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
              <p className="text-muted-foreground text-center">No notifications yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
