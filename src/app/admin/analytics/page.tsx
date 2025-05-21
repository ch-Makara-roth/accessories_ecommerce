
// src/app/admin/analytics/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Activity, BarChart2, Percent, TrendingUp, Globe, MapPin, Eye, Clock } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const analyticsStats = [
    { title: 'Total Visitors', value: '12,879', icon: Users, change: '+15.2% this month' },
    { title: 'Conversion Rate', value: '3.45%', icon: Percent, change: '+0.5% vs last month' },
    { title: 'Bounce Rate', value: '45.6%', icon: TrendingUp, change: '-2.1% (improved)' },
    { title: 'Avg. Session', value: '3m 45s', icon: Clock, change: '+12s vs last month' },
  ];

  const topPagesData = [
    { path: '/home', views: '5,234 views' },
    { path: '/product/wireless-earbuds', views: '3,102 views' },
    { path: '/category/headphones', views: '2,500 views' },
    { path: '/cart', views: '1,800 views' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-foreground">Store Analytics</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {analyticsStats.map((stat) => (
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
              <BarChart2 className="mr-2 h-5 w-5 text-primary" />
              Traffic Sources
            </CardTitle>
            <CardDescription>Overview of where your visitors are coming from.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/50 rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Traffic Sources Chart Placeholder</p>
            </div>
            {/* Example: <BarChart data={trafficData} /> */}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5 text-primary" />
              User Demographics
            </CardTitle>
            <CardDescription>Insights into your audience demographics.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/50 rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Demographics Chart Placeholder (e.g., by Country, Age)</p>
            </div>
            {/* Example: <PieChart data={demographicsData} /> */}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5 text-primary" />
              Top Pages
            </CardTitle>
            <CardDescription>Most viewed pages on your store.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {topPagesData.map((page) => (
                <li key={page.path} className="flex justify-between items-center text-foreground/80 hover:text-foreground transition-colors">
                  <span className="truncate">{page.path}</span>
                  <span className="font-medium text-muted-foreground">{page.views}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-primary" />
              Real-time Activity
            </CardTitle>
            <CardDescription>Live view of store interactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 bg-muted/50 rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Real-time Stats Placeholder</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">e.g., Active users, Current cart additions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
