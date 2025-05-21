
// src/app/account/page.tsx (Customer Dashboard)
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { User, Package, Bell, Settings } from 'lucide-react';

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground flex items-center">
          <User className="mr-3 h-7 w-7 text-primary" />
          Welcome, Customer!
        </h1>
        {/* Placeholder for a potential quick action like "Edit Profile" */}
        <Button variant="outline" asChild>
          <Link href="/account/settings">Edit Profile</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Package className="mr-2 h-5 w-5 text-primary" />
              My Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>View your recent orders and track shipments.</CardDescription>
            <Button variant="link" className="p-0 mt-2 text-primary" asChild>
              <Link href="/account/orders">Go to Orders &rarr;</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Bell className="mr-2 h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Check your latest alerts and updates.</CardDescription>
             <Button variant="link" className="p-0 mt-2 text-primary" asChild>
              <Link href="/account/notifications">View Notifications &rarr;</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Settings className="mr-2 h-5 w-5 text-primary" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Manage your profile, password, and preferences.</CardDescription>
             <Button variant="link" className="p-0 mt-2 text-primary" asChild>
              <Link href="/account/settings">Go to Settings &rarr;</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>A quick look at what you've been up to.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                Placeholder for recent activities like viewed items, wishlist, etc.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
