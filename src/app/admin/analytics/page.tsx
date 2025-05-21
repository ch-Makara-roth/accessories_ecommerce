
// src/app/admin/analytics/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-foreground">Analytics</h1>
      <Card>
        <CardHeader>
          <CardTitle>Store Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Placeholder for analytics dashboards, charts (e.g., sales trends, user engagement).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
