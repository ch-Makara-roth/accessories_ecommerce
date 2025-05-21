
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, ShoppingBag, Users, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    { title: 'Total Revenue', value: '$12,345', icon: DollarSign, change: '+12.5%' },
    { title: 'Total Sales', value: '567', icon: ShoppingBag, change: '+8.2%' },
    { title: 'Active Users', value: '1,234', icon: Users, change: '+5.1%' },
    { title: 'Site Activity', value: 'High', icon: Activity, change: 'Last 24h' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Overview of recent actions in the store.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Placeholder for recent activity feed or chart...</p>
            {/* Example: <RecentSalesChart /> */}
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Common administrative tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-primary hover:underline cursor-pointer">Manage Products</p>
            <p className="text-primary hover:underline cursor-pointer">View Orders</p>
            <p className="text-primary hover:underline cursor-pointer">User Management</p>
            <p className="text-primary hover:underline cursor-pointer">Store Settings</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
