
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Search, Edit2, Trash2, MoreHorizontal, Filter as FilterIcon, Loader2, X } from 'lucide-react';
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
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useState, useEffect, useCallback } from 'react';
import type { Product, Category as CategoryType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client'; // Import Role enum

export default function AdminProductsPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [selectedCategoryIdsInDialog, setSelectedCategoryIdsInDialog] = useState<string[]>([]);
  const [selectedStatusesInDialog, setSelectedStatusesInDialog] = useState<string[]>([]);
  
  const [appliedCategoryIds, setAppliedCategoryIds] = useState<string[]>([]);
  const [appliedStatuses, setAppliedStatuses] = useState<string[]>([]);

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [availableCategories, setAvailableCategories] = useState<CategoryType[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [statusSearchTerm, setStatusSearchTerm] = useState('');

  const availableStatuses = ['Active', 'Draft', 'Archived', 'Scheduled'];

  const fetchProducts = useCallback(async (categoryIdsToFetch?: string[], statusesToFetch?: string[]) => {
    setLoading(true);
    setError(null);
    let url = '/api/products';
    const queryParams = new URLSearchParams();

    if (categoryIdsToFetch && categoryIdsToFetch.length > 0) {
      queryParams.append('categoryId', categoryIdsToFetch.join(','));
    }
    if (statusesToFetch && statusesToFetch.length > 0) {
      queryParams.append('status', statusesToFetch.join(','));
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
    fetchProducts(appliedCategoryIds, appliedStatuses);
  }, [fetchProducts, appliedCategoryIds, appliedStatuses]);

  useEffect(() => {
    fetchCategoriesForFilter();
  }, [fetchCategoriesForFilter]);

  useEffect(() => {
    // Sync dialog selections with applied filters when dialog opens
    if (isFilterDialogOpen) {
      setSelectedCategoryIdsInDialog([...appliedCategoryIds]);
      setSelectedStatusesInDialog([...appliedStatuses]);
    }
  }, [isFilterDialogOpen, appliedCategoryIds, appliedStatuses]);

  const handleApplyFiltersInDialog = () => {
    setAppliedCategoryIds([...selectedCategoryIdsInDialog]);
    setAppliedStatuses([...selectedStatusesInDialog]);

    let filterDesc = "Filters applied: ";
    const activeCategoryNames = selectedCategoryIdsInDialog
      .map(id => availableCategories.find(cat => cat.id === id)?.name)
      .filter(Boolean);

    if (activeCategoryNames.length > 0) filterDesc += `Categories (${activeCategoryNames.join(', ')}) `;
    if (selectedStatusesInDialog.length > 0) filterDesc += `Statuses (${selectedStatusesInDialog.join(', ')})`;

    if (activeCategoryNames.length === 0 && selectedStatusesInDialog.length === 0) {
      filterDesc = "Showing all products.";
    }
    
    toast({ title: 'Product Filters Updated', description: filterDesc });
    setIsFilterDialogOpen(false); // Close dialog after applying
  };
  
  const handleClearDialogSelections = () => {
    setSelectedCategoryIdsInDialog([]);
    setSelectedStatusesInDialog([]);
    setCategorySearchTerm('');
    setStatusSearchTerm('');
  };

  const handleResetAllFilters = () => {
    setAppliedCategoryIds([]);
    setAppliedStatuses([]);
    setSelectedCategoryIdsInDialog([]); // Also clear dialog selections
    setSelectedStatusesInDialog([]);
    setCategorySearchTerm('');
    setStatusSearchTerm('');
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
      fetchProducts(appliedCategoryIds, appliedStatuses);
    } catch (error) {
      console.error("Error deleting product:", error);
      const errorToDisplay = error instanceof Error ? error : new Error(String(error));
      toast({ variant: 'destructive', title: 'Error Deleting Product', description: errorToDisplay.message });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCategoryCheckboxChange = (categoryId: string) => {
    setSelectedCategoryIdsInDialog(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleStatusCheckboxChange = (statusValue: string) => {
    setSelectedStatusesInDialog(prev =>
      prev.includes(statusValue)
        ? prev.filter(s => s !== statusValue)
        : [...prev, statusValue]
    );
  };

  const filteredDisplayCategories = availableCategories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  const filteredDisplayStatuses = availableStatuses.filter(status =>
    status.toLowerCase().includes(statusSearchTerm.toLowerCase())
  );
  
  const canAddProduct = userRole === Role.ADMIN || userRole === Role.SELLER;
  const canDeleteProduct = userRole === Role.ADMIN;
  const canEditProduct = userRole === Role.ADMIN || userRole === Role.SELLER;

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
          <Button onClick={() => fetchProducts(appliedCategoryIds, appliedStatuses)} className="mt-4">Try Again</Button>
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
              <TableCell>{product.category?.name || 'N/A'}</TableCell>
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

  const activeFilterCount = appliedCategoryIds.length + appliedStatuses.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Products</h1>
      </div>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Products list</CardTitle>
          <div className="flex items-center gap-2">
            <Dialog open={isFilterDialogOpen} onOpenChange={(open) => {
                setIsFilterDialogOpen(open);
                if (!open) { 
                   // User closed dialog without explicit "Apply", so we apply current dialog selections
                   handleApplyFiltersInDialog();
                }
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <FilterIcon className="mr-2 h-4 w-4" /> Filters
                    {activeFilterCount > 0 && (
                       <span className="ml-2 bg-background text-primary rounded-full px-1.5 py-0.5 text-xs font-semibold">
                         {activeFilterCount}
                       </span>
                    )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg p-0"> {/* Custom width */}
                <DialogHeader className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-lg font-semibold">Filters</DialogTitle>
                    <Link href="#" className="text-sm text-primary hover:underline" onClick={(e) => e.preventDefault()}>Save view</Link>
                  </div>
                </DialogHeader>
                <div className="p-4 space-y-4">
                    <Accordion type="multiple" className="w-full space-y-2"  defaultValue={['category-filter', 'status-filter']}>
                        <AccordionItem value="category-filter" className="border-b-0">
                            <AccordionTrigger className="text-sm font-medium hover:no-underline py-2 px-1 rounded hover:bg-muted/50">Category</AccordionTrigger>
                            <AccordionContent className="pt-2 space-y-2">
                                <div className="relative">
                                    <Input 
                                        placeholder="Search categories..." 
                                        value={categorySearchTerm}
                                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                                        className="pl-8 text-xs h-8"
                                    />
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                <ScrollArea className="h-[150px] pr-3">
                                    <div className="space-y-1.5">
                                    {isLoadingCategories ? <p className="text-xs text-muted-foreground">Loading categories...</p> :
                                     filteredDisplayCategories.length > 0 ? filteredDisplayCategories.map(cat => (
                                        <div key={cat.id} className="flex items-center space-x-2">
                                            <Checkbox 
                                                id={`cat-${cat.id}`} 
                                                checked={selectedCategoryIdsInDialog.includes(cat.id)}
                                                onCheckedChange={() => handleCategoryCheckboxChange(cat.id)}
                                            />
                                            <Label htmlFor={`cat-${cat.id}`} className="text-xs font-normal cursor-pointer">{cat.name}</Label>
                                        </div>
                                     )) : <p className="text-xs text-muted-foreground">No categories found.</p>}
                                    </div>
                                </ScrollArea>
                                 <Link href="#" className="text-xs text-primary hover:underline mt-1 block" onClick={(e) => e.preventDefault()}>View all...</Link>
                            </AccordionContent>
                        </AccordionItem>
                        
                        <Separator />

                        <AccordionItem value="status-filter" className="border-b-0">
                            <AccordionTrigger className="text-sm font-medium hover:no-underline py-2 px-1 rounded hover:bg-muted/50">Status</AccordionTrigger>
                            <AccordionContent className="pt-2 space-y-2">
                                 <div className="relative">
                                    <Input 
                                        placeholder="Search statuses..." 
                                        value={statusSearchTerm}
                                        onChange={(e) => setStatusSearchTerm(e.target.value)}
                                        className="pl-8 text-xs h-8"
                                    />
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                <ScrollArea className="h-[100px] pr-3">
                                    <div className="space-y-1.5">
                                    {filteredDisplayStatuses.map(status => (
                                        <div key={status} className="flex items-center space-x-2">
                                            <Checkbox 
                                                id={`status-${status}`}
                                                checked={selectedStatusesInDialog.includes(status)}
                                                onCheckedChange={() => handleStatusCheckboxChange(status)}
                                            />
                                            <Label htmlFor={`status-${status}`} className="text-xs font-normal cursor-pointer">{status}</Label>
                                        </div>
                                    ))}
                                    </div>
                                </ScrollArea>
                                 <Link href="#" className="text-xs text-primary hover:underline mt-1 block" onClick={(e) => e.preventDefault()}>View all...</Link>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
                {/* Footer removed as per request */}
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={handleResetAllFilters}>Reset Filters</Button>
            
            {canAddProduct && (
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="sm" asChild>
                  <Link href="/admin/products/add">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New
                  </Link>
                </Button>
            )}
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
