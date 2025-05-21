
// src/app/admin/sales/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, ShoppingBag, Users, BarChart3, ListOrdered } from 'lucide-react';

export default function AdminSalesPage() {
  const salesStats = [
    { title: 'Total Revenue', value: '$45,231.89', icon: DollarSign, change: '+20.1% from last month' },
    { title: 'Total Sales', value: '+1,234', icon: ShoppingBag, change: '+180.1% from last month' },
    { title: 'Average Order Value', value: '$87.50', icon: DollarSign, change: '+5.2% from last month' },
    { title: 'New Customers', value: '+573', icon: Users, change: '+20 since last hour' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-foreground">Sales Overview</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {salesStats.map((stat) => (
          <Card key={stat.title} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-primary" />
              Sales Trends
            </CardTitle>
            <CardDescription>Visual representation of sales performance over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/50 rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Sales Chart Placeholder</p>
            </div>
            {/* In a real app, you'd use a charting library here, e.g., Recharts with Shadcn Chart components */}
            {/* Example: <LineChart width={500} height={300} data={data}>...</LineChart> */}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ListOrdered className="mr-2 h-5 w-5 text-primary" />
              Recent Orders
            </CardTitle>
            <CardDescription>A quick look at the latest transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Placeholder for recent orders list */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                  <div>
                    <p className="font-medium text-sm">Order #123{i + 45}</p>
                    <p className="text-xs text-muted-foreground">Customer Name {i+1} - 2 items</p>
                  </div>
                  <p className="font-semibold text-sm text-primary">${(75 + i * 15).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="text-right mt-4">
                <a href="#" className="text-sm text-primary hover:underline">View All Orders &rarr;</a>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Products that are currently performing the best.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for top selling products */}
          <ul className="space-y-2">
            <li className="text-muted-foreground text-sm">1. Wireless Earbuds - 150 units</li>
            <li className="text-muted-foreground text-sm">2. Airpods Max - 90 units</li>
            <li className="text-muted-foreground text-sm">3. Bose BT Earphones - 75 units</li>
          </ul>
           <div className="text-right mt-4">
                <a href="/admin/products" className="text-sm text-primary hover:underline">Manage Products &rarr;</a>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
