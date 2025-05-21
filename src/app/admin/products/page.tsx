
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Placeholder data - in a real app, this would come from your backend/database
const placeholderProducts = [
  { id: 'p1', name: 'Wireless Earbuds', category: 'Headphones', price: 99, stock: 150, status: 'Published' },
  { id: 'p2', name: 'Airpods Max', category: 'Headphones', price: 159, stock: 75, status: 'Published' },
  { id: 'p3', name: 'Bose BT Earphones', category: 'Headphones', price: 129, stock: 0, status: 'Out of Stock' },
  { id: 'p4', name: 'JBL TUNE 600BTNC', category: 'Headphones', price: 69, stock: 200, status: 'Draft' },
];

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-primary">Manage Products</h1>
            <p className="text-muted-foreground">View, add, edit, or delete products.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Product
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>
            A list of all products in your store.
            <div className="mt-4 flex items-center gap-2">
                <Input placeholder="Search products..." className="max-w-sm" />
                <Button variant="outline" size="icon"><Search className="h-4 w-4" /></Button>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placeholderProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <img 
                        src="https://placehold.co/60x60.png" 
                        alt={product.name} 
                        className="h-12 w-12 object-cover rounded-md"
                        data-ai-hint="product thumbnail" 
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{product.stock}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                        product.status === 'Published' ? 'bg-green-100 text-green-700' 
                        : product.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                        {product.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Product Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit2 className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
       {/* Pagination placeholder */}
        <div className="flex justify-center mt-6">
            <Button variant="outline" size="sm" className="mr-2">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
        </div>
    </div>
  );
}
