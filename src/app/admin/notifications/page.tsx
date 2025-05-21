
// src/app/admin/notifications/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-foreground">Notifications</h1>
      <Card>
        <CardHeader>
          <CardTitle>System Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Placeholder for a list of admin notifications (e.g., low stock, new high-value orders).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
