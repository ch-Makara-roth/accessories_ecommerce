
// src/app/admin/products/add/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

export default function AddProductPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground">Add New Product</h1>
        <Button variant="outline" asChild>
          <Link href="/admin/products">Back to Product List</Link>
        </Button>
      </div>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>Fill in the details for the new product.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input id="productName" placeholder="e.g., Wireless Headphones" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productCategory">Category</Label>
              <Input id="productCategory" placeholder="e.g., Electronics" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="productDescription">Description</Label>
            <Textarea id="productDescription" placeholder="Describe the product..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="productPrice">Price ($)</Label>
              <Input id="productPrice" type="number" placeholder="e.g., 99.99" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productStock">Stock Quantity</Label>
              <Input id="productStock" type="number" placeholder="e.g., 100" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="productStatus">Status</Label>
              {/* In a real app, this would be a Select component */}
              <Input id="productStatus" placeholder="e.g., Active, Draft" />
            </div>
          </div>
           <div className="space-y-2">
              <Label htmlFor="productImage">Product Image URL</Label>
              <Input id="productImage" placeholder="https://example.com/image.png" />
            </div>
          <div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Save Product
            </Button>
          </div>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        Note: This is a placeholder form. Submitting will not yet save data to the database.
      </p>
    </div>
  );
}
