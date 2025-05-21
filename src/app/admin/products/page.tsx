
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Search, Edit2, Trash2, MoreHorizontal, Filter as FilterIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import type { Product } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          let errorResponseText = await response.text();
          let serverErrorMsg = `Server responded with ${response.status}: ${response.statusText || ''}`;
          try {
            const errorJson = JSON.parse(errorResponseText);
            serverErrorMsg = errorJson.error || errorJson.details || serverErrorMsg;
          } catch (parseError) {
            if (errorResponseText && errorResponseText.length > 0 && errorResponseText.length < 500 && !errorResponseText.toLowerCase().startsWith('<!doctype html>')) {
                serverErrorMsg += ` (Content: ${errorResponseText.substring(0,150)}...)`;
            } else if (errorResponseText) {
                serverErrorMsg += ` (Non-JSON or HTML content received from server)`;
            }
            console.error("Failed to parse API error response as JSON. Status:", response.status, parseError);
            console.error("Original API error response text snippet:", errorResponseText.substring(0, 500));
          }
          throw new Error(serverErrorMsg);
        }
        const data = await response.json(); 
        setProducts(data.products || []);
      } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error fetching products",
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [toast]);

  const handleSeeAllClick = () => {
    console.log('See All button clicked. Implement navigation or filter clearing logic here.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive font-semibold">Error loading products:</p>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Products</h1>
      </div>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold">Products list</CardTitle>
            <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <FilterIcon className="mr-2 h-4 w-4" /> Filter
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Filter Products</DialogTitle>
                      <DialogDescription>
                        Select your filter criteria below. (Filtering functionality not yet implemented.)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <p className="text-sm text-muted-foreground">
                        Placeholder for filter options (e.g., by category, price range, status).
                      </p>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="button">Apply Filters</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" size="sm" onClick={handleSeeAllClick}>See All</Button>
                
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="sm" asChild>
                  <Link href="/admin/products/add">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New
                  </Link>
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No products found. Try adding some!</p>
          ) : (
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
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox id={`select-${product.id}`} />
                    </TableCell>
                    <TableCell className="font-medium flex items-center gap-3">
                      <Image 
                          src={product.image || 'https://placehold.co/40x40.png'} 
                          alt={product.name} 
                          width={40}
                          height={40}
                          className="h-10 w-10 object-cover rounded"
                          data-ai-hint={product.dataAiHint || "product thumbnail"}
                          onError={(e) => { const target = e.target as HTMLImageElement; target.src = 'https://placehold.co/40x40.png'; }}
                      />
                      {product.name}
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{product.stock || 0}</TableCell>
                    <TableCell>
                      <span className={cn("px-2 py-0.5 text-xs rounded-full font-medium",
                          product.status === 'Active' ? 'bg-green-100 text-green-700' 
                          : product.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' 
                          : product.status === 'Draft' ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      )}>
                          {product.status || 'N/A'}
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
          )}
        </CardContent>
      </Card>
       {/* Pagination placeholder */}
        <div className="flex items-center justify-between mt-6">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <div className="flex items-center gap-1 text-sm">
                <Button variant="default" size="sm" className="h-8 w-8 p-0">1</Button>
            </div>
            <Button variant="outline" size="sm" disabled>Next</Button>
        </div>
    </div>
  );
}
