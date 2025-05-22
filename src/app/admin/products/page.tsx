
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
import { cn } from '@/lib/utils';
import { useState, useEffect, useCallback } from 'react';
import type { Product, Category as CategoryType } from '@/types'; 
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined); // Changed initial state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [availableCategories, setAvailableCategories] = useState<CategoryType[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const fetchProducts = useCallback(async () => {
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
          if (errorResponseText && errorResponseText.trim().toLowerCase().startsWith('<!doctype html>')) {
            serverErrorMsg = `Server returned an HTML error page (status ${response.status}). This often indicates a server-side configuration issue (e.g., MONGODB_URI in .env.local is missing/incorrect, or an unhandled error in the API route). Please check your server console logs for more details.`;
          } else if (errorResponseText) {
             serverErrorMsg += ` (Raw server response snippet: ${errorResponseText.substring(0,150)}...)`;
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
      if (description === 'Failed to fetch') {
        description = 'Network error or server unreachable. Please check your internet connection and ensure the server is running correctly. Review server console logs for critical errors.';
      } else if (description.includes("Server returned an HTML error page") || description.includes("Prisma product model is not accessible")) {
        // Keep the specific HTML error message
      } else if (description.includes("prisma.product is undefined") || description.includes("prisma.product.findMany is not a function") || description.includes("Prisma product model is not accessible")) {
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
  }, [toast]);

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
    fetchCategoriesForFilter();
  }, [fetchProducts, fetchCategoriesForFilter]);

  const handleSeeAllClick = () => {
    toast({
      title: 'Filters Cleared',
      description: 'Displaying all products.',
    });
    setFilterCategory(undefined);
    setFilterStatus(undefined);
    fetchProducts(); 
  };

  const handleApplyFilters = () => {
    const categoryToLog = filterCategory === 'all' || filterCategory === undefined ? 'Any' : filterCategory;
    const statusToLog = filterStatus === 'all-statuses' || filterStatus === undefined ? 'Any' : filterStatus;
    toast({
        title: 'Filters Applied (Mock)',
        description: `Category: ${categoryToLog}, Status: ${statusToLog}`,
    });
    console.log('Applying filters:', { category: filterCategory, status: filterStatus });
    // Here you would typically re-fetch products with filter query parameters
    // For now, it's just logging and showing a toast.
  };
  
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Failed to delete product. Status: ${response.status}`);
      }
      toast({ title: 'Product Deleted', description: `Product "${productToDelete.name}" has been deleted.` });
      setProductToDelete(null);
      fetchProducts(); 
    } catch (error) {
      console.error("Error deleting product:", error);
      const errorToDisplay = error instanceof Error ? error : new Error(String(error));
      toast({ variant: 'destructive', title: 'Error Deleting Product', description: errorToDisplay.message });
    } finally {
      setIsDeleting(false);
    }
  };

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
        <p className="text-center text-muted-foreground py-8">No products found. Try adding some!</p>
      );
    }

    return (
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
              <TableCell>{typeof product.category === 'object' && product.category !== null ? product.category.name : product.category || 'N/A'}</TableCell>
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
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/products/edit/${product.id}`}>
                        <Edit2 className="mr-2 h-4 w-4" /> Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setProductToDelete(product)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
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
                        Select your filter criteria below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="filter-category">Category</Label>
                        <Select value={filterCategory} onValueChange={setFilterCategory} disabled={isLoadingCategories}>
                          <SelectTrigger id="filter-category">
                            <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select category"} />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingCategories ? (
                               <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                            ) : (
                              <>
                                <SelectItem value="all">All Categories</SelectItem>
                                {availableCategories.length > 0 ? availableCategories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                  </SelectItem>
                                )) : (
                                  <SelectItem value="no-categories-found" disabled>No categories found</SelectItem>
                                )}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="filter-status">Status</Label>
                         <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger id="filter-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all-statuses">All Statuses</SelectItem> {/* Changed value */}
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Archived">Archived</SelectItem>
                            <SelectItem value="Scheduled">Scheduled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">
                          Cancel
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button type="button" onClick={handleApplyFilters}>Apply Filters</Button>
                      </DialogClose>
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

