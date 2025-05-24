
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Edit2, Trash2, MoreHorizontal, Loader2, Filter as FilterIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useState, useEffect, useCallback } from 'react';
import type { Product, Category as CategoryType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client';

export default function AdminProductsPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [availableCategories, setAvailableCategories] = useState<CategoryType[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // New filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all'); // 'all' or category ID
  const [filterStatus, setFilterStatus] = useState<string>('all-statuses'); // 'all-statuses' or status string

  const availableStatuses = ['Active', 'Draft', 'Archived', 'Scheduled'];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    let url = '/api/products';
    const queryParams = new URLSearchParams();

    if (searchTerm.trim()) {
      queryParams.append('searchQuery', searchTerm.trim());
    }
    if (filterCategory && filterCategory !== 'all') {
      queryParams.append('categoryId', filterCategory);
    }
    if (filterStatus && filterStatus !== 'all-statuses') {
      queryParams.append('status', filterStatus);
    }

    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        let errorResponseText = await response.text();
        let serverErrorMsg = `Server responded with ${response.status}: ${response.statusText || ''}`;
        try {
          const errorJson = JSON.parse(errorResponseText);
          serverErrorMsg = errorJson.error || errorJson.details || serverErrorMsg;
          if (serverErrorMsg.includes("<!doctype html>")) {
            serverErrorMsg = `Server returned an HTML error page (status ${response.status}). This often indicates a server-side configuration issue (e.g., MONGODB_URI in .env.local is missing/incorrect, or an unhandled error in the API route). Please check your server console logs for more details.`;
          }
        } catch (parseError) {
          if (errorResponseText && errorResponseText.trim().toLowerCase().startsWith('<!doctype html>')) {
            serverErrorMsg = `Server returned an HTML error page (status ${response.status}). This often indicates a server-side configuration issue (e.g., MONGODB_URI in .env.local is missing/incorrect, or an unhandled error in the API route). Please check your server console logs for more details.`;
          } else if (errorResponseText) {
            serverErrorMsg += ` (Client-side: Raw server response snippet: ${errorResponseText.substring(0, 150)}...)`;
          }
          console.error("Client-side: Failed to parse API error response as JSON. Status:", response.status, parseError);
          console.error("Client-side: Original API error response text snippet:", errorResponseText.substring(0, 500));
        }
        throw new Error(serverErrorMsg);
      }
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Full error object in fetchProducts:", err);
      const errorToDisplay = err instanceof Error ? err : new Error(String(err));

      let description = errorToDisplay.message;
      if (description.includes("Failed to fetch")) {
        description = "Network error or server unreachable. Please check your internet connection and ensure the server is running correctly. Review server console logs for critical errors.";
      } else if (description.includes("Server returned an HTML error page") || description.includes("Prisma product model is not accessible")) {
        // Keep specific error message
      } else if (description.includes("prisma.product is undefined") || description.includes("prisma.product.findMany is not a function")) {
        description = "Internal Server Error: Prisma product model is not accessible. Ensure `npx prisma generate` has been run and server restarted.";
      }

      setError(description);
      toast({
        variant: "destructive",
        title: "Error Fetching Products",
        description: description,
        duration: 9000,
      });
    } finally {
      setLoading(false);
    }
  }, [toast, searchTerm, filterCategory, filterStatus]);

  const fetchCategoriesForFilter = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch categories for filter.' }));
        throw new Error(errorData.error || `Failed to fetch categories. Status: ${response.status}`);
      }
      const data: CategoryType[] = await response.json();
      setAvailableCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories for filter:", error);
      toast({
        variant: 'destructive',
        title: 'Error Fetching Categories',
        description: error instanceof Error ? error.message : String(error),
      });
      setAvailableCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategoriesForFilter();
  }, [fetchCategoriesForFilter]);
  
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterCategory('all');
    setFilterStatus('all-statuses');
    // fetchProducts will be called by the useEffect due to state changes
    toast({ title: 'Filters Cleared', description: 'Displaying all products.' });
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const result = await response.json().catch(() => ({error: 'Failed to delete product and parse error'}));
        throw new Error(result.error || `Failed to delete product. Status: ${response.status}`);
      }
      toast({ title: 'Product Deleted', description: `Product "${productToDelete.name}" has been deleted.` });
      setProductToDelete(null);
      fetchProducts(); // Re-fetch products
    } catch (error) {
      console.error("Error deleting product:", error);
      const errorToDisplay = error instanceof Error ? error : new Error(String(error));
      toast({ variant: 'destructive', title: 'Error Deleting Product', description: errorToDisplay.message });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const canAddProduct = userRole && [Role.ADMIN, Role.SELLER, Role.STOCK].includes(userRole as Role);
  const canDeleteProduct = userRole && [Role.ADMIN, Role.STOCK].includes(userRole as Role);
  const canEditProduct = userRole && [Role.ADMIN, Role.SELLER, Role.STOCK].includes(userRole as Role);

  const renderContent = () => {
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
        <div className="text-center py-10 px-4">
          <p className="text-destructive font-semibold mb-2">Error loading products:</p>
          <p className="text-muted-foreground mb-4 text-sm break-words">{error}</p>
          <Button onClick={() => fetchProducts()} className="mt-4">Try Again</Button>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <p className="text-center text-muted-foreground py-8">No products found. Try adding some or adjusting filters!</p>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox id="selectAllProducts" aria-label="Select all products" />
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
                <Checkbox id={`select-product-${product.id}`} aria-label={`Select product ${product.name}`} />
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
              <TableCell>{product.category?.name || 'N/A'}</TableCell>
              <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
              <TableCell className="text-right">{product.stock ?? 0}</TableCell>
              <TableCell>
                <span className={cn("px-2 py-0.5 text-xs rounded-full font-medium",
                  product.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : product.status === 'Scheduled' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : product.status === 'Draft' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300'
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
                    {canEditProduct && (
                       <DropdownMenuItem asChild>
                          <Link href={`/admin/products/edit/${product.id}`}>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                    )}
                    {canDeleteProduct && (
                       <DropdownMenuItem onClick={() => setProductToDelete(product)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    )}
                    {(!canEditProduct && !canDeleteProduct) && <DropdownMenuItem disabled>No actions available</DropdownMenuItem>}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Products</h1>
         {canAddProduct && (
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="sm" asChild>
              <Link href="/admin/products/add">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New
              </Link>
            </Button>
        )}
      </div>

      {/* New Filter Bar */}
      <div className="p-4 bg-card rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label htmlFor="product-search" className="text-xs font-medium text-muted-foreground">Search Products</label>
            <Input
              id="product-search"
              placeholder="Filter by name, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="filter-category" className="text-xs font-medium text-muted-foreground">Filter by Category</label>
            <Select value={filterCategory} onValueChange={setFilterCategory} disabled={isLoadingCategories}>
              <SelectTrigger id="filter-category" className="h-9 text-sm">
                <SelectValue placeholder={isLoadingCategories ? "Loading..." : "All Categories"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
             <label htmlFor="filter-status" className="text-xs font-medium text-muted-foreground">Filter by Status</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger id="filter-status" className="h-9 text-sm">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-statuses">All Statuses</SelectItem>
                {availableStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleResetFilters} variant="outline" size="sm" className="h-9 text-sm">
             <FilterIcon className="mr-1.5 h-4 w-4" /> Reset Filters
          </Button>
        </div>
      </div>


      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Products list</CardTitle>
          {/* Removed old filter dialog trigger and add button (moved above) */}
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>

      {!loading && !error && products.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <div className="flex items-center gap-1 text-sm">
            <Button variant="default" size="sm" className="h-8 w-8 p-0">1</Button>
          </div>
          <Button variant="outline" size="sm" disabled>Next</Button>
        </div>
      )}

      {productToDelete && (
        <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product "{productToDelete.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setProductToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteProduct} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
