
// src/app/admin/sales/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSalesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-foreground">Sales</h1>
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Placeholder for sales data, charts, and reports.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
