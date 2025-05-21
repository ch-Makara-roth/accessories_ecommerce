
// src/app/admin/products/categories/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground">Categories</h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Category
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Placeholder for category management interface (e.g., table of categories, add/edit forms).
          </p>
          {/* Example: A list or table of categories would go here */}
        </CardContent>
      </Card>
    </div>
  );
}
