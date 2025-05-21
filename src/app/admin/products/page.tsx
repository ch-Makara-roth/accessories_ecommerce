
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Search, Edit2, Trash2, MoreHorizontal, Filter as FilterIcon } from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils'; // Added missing import

// Placeholder data - in a real app, this would come from your backend/database
const placeholderProducts = [
  { id: 'p1', name: 'T-Shirt', category: 'Women Cloths', price: 79.80, stock: 79, status: 'Scheduled', imageUrl: 'https://placehold.co/40x40.png' },
  { id: 'p2', name: 'Shirt', category: 'Man Cloths', price: 76.89, stock: 86, status: 'Active', imageUrl: 'https://placehold.co/40x40.png' },
  { id: 'p3', name: 'Pant', category: 'Kid Cloths', price: 86.65, stock: 74, status: 'Draft', imageUrl: 'https://placehold.co/40x40.png' },
  { id: 'p4', name: 'Sweater', category: 'Man Cloths', price: 56.07, stock: 69, status: 'Active', imageUrl: 'https://placehold.co/40x40.png' },
  { id: 'p5', name: 'Sweater', category: 'Man Cloths', price: 56.07, stock: 69, status: 'Scheduled', imageUrl: 'https://placehold.co/40x40.png' },
  { id: 'p6', name: 'Light Jacket', category: 'Women Cloths', price: 36.00, stock: 65, status: 'Draft', imageUrl: 'https://placehold.co/40x40.png' },
  { id: 'p7', name: 'Half Shirt', category: 'Man Cloths', price: 46.78, stock: 58, status: 'Active', imageUrl: 'https://placehold.co/40x40.png' },
];

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Products</h1>
      </div>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold">Products list</CardTitle>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                    <FilterIcon className="mr-2 h-4 w-4" /> Filter
                </Button>
                <Button variant="outline" size="sm">See All</Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                    <Checkbox id="selectAll" />
                </TableHead>
                <TableHead>Product Name</TableHead>
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
                    <Checkbox id={`select-${product.id}`} />
                  </TableCell>
                  <TableCell className="font-medium flex items-center gap-3">
                    <Image 
                        src={product.imageUrl} 
                        alt={product.name} 
                        width={40}
                        height={40}
                        className="h-10 w-10 object-cover rounded"
                        data-ai-hint="product thumbnail" 
                    />
                    {product.name}
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{product.stock}</TableCell>
                  <TableCell>
                    <span className={cn("px-2 py-0.5 text-xs rounded-full font-medium",
                        product.status === 'Active' ? 'bg-green-100 text-green-700' 
                        : product.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' 
                        : product.status === 'Draft' ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    )}>
                        {product.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                        Det {/* Placeholder for "Details" or action */}
                    </Button>
                    {/* Or use Dropdown for more actions if needed
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
                    */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
       {/* Pagination placeholder */}
        <div className="flex items-center justify-between mt-6">
            <Button variant="outline" size="sm">Previous</Button>
            <div className="flex items-center gap-1 text-sm">
                <Button variant="default" size="sm" className="h-8 w-8 p-0">1</Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">2</Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">3</Button>
                <span>...</span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">8</Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">9</Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">10</Button>
            </div>
            <Button variant="outline" size="sm">Next</Button>
        </div>
    </div>
  );
}
