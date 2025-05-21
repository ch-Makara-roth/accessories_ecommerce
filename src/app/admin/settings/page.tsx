
// src/app/admin/settings/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Placeholder for various admin settings (e.g., store information, payment gateways, shipping options).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
