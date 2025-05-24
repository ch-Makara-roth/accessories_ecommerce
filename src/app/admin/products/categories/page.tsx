
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
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
import { PlusCircle, Edit2, Trash2, MoreHorizontal, Loader2, Filter as FilterIcon } from 'lucide-react';
import type { Category } from '@/types'; 
import React, { useState, useEffect, type FormEvent, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');

  // New filter state for categories
  const [categorySearchTerm, setCategorySearchTerm] = useState('');

  const { toast } = useToast();

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    let url = '/api/categories';
    const queryParams = new URLSearchParams();
    if (categorySearchTerm.trim()) {
      queryParams.append('searchQuery', categorySearchTerm.trim());
    }
    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            const textError = await response.text();
            errorData = { error: "Failed to fetch categories", details: textError.substring(0, 200) + (textError.length > 200 ? "..." : "") };
        }
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }
      const data: Category[] = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Full error object in fetchCategories:", err);
      const errorToDisplay = err instanceof Error ? err : new Error(String(err));
      
      let description = errorToDisplay.message;
      if (description === 'Failed to fetch') {
        description = 'Network error or server unreachable. Please check your internet connection and ensure the server is running correctly. Review server console logs for critical errors.';
      }
      
      setError(description);
      toast({ variant: "destructive", title: "Error Fetching Categories", description: description, duration: 9000 });
    } finally {
      setIsLoading(false);
    }
  }, [categorySearchTerm, toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newCategoryName.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Category name cannot be empty.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Failed to add category. Status: ${response.status}`);
      }
      toast({ title: 'Category Added!', description: `Category "${result.name}" has been added.` });
      setNewCategoryName('');
      setIsAddDialogOpen(false);
      fetchCategories(); 
    } catch (error) {
      console.error("Error adding category:", error);
      const errorToDisplay = error instanceof Error ? error : new Error(String(error));
      let description = errorToDisplay.message;
      if (description === 'Failed to fetch') {
        description = 'Network error: Could not add category. Please check your connection and try again.';
      }
      toast({ variant: 'destructive', title: 'Error Adding Category', description: description });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (category: Category) => {
    setCategoryToEdit(category);
    setEditedCategoryName(category.name);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!categoryToEdit || !editedCategoryName.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Category name cannot be empty.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/categories/${categoryToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editedCategoryName.trim() }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Failed to update category. Status: ${response.status}`);
      }
      toast({ title: 'Category Updated!', description: `Category "${result.name}" has been updated.` });
      setIsEditDialogOpen(false);
      setCategoryToEdit(null);
      fetchCategories(); 
    } catch (error) {
      console.error("Error updating category:", error);
      const errorToDisplay = error instanceof Error ? error : new Error(String(error));
      toast({ variant: 'destructive', title: 'Error Updating Category', description: errorToDisplay.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Failed to delete category. Status: ${response.status}`);
      }
      toast({ title: 'Category Deleted', description: `Category "${categoryToDelete.name}" has been deleted.` });
      setCategoryToDelete(null); 
      fetchCategories(); 
    } catch (error) {
      console.error("Error deleting category:", error);
      const errorToDisplay = error instanceof Error ? error : new Error(String(error));
      let description = errorToDisplay.message;
      if (description === 'Failed to fetch') {
        description = 'Network error: Could not delete category. Please check your connection and try again.';
      }
      toast({ variant: 'destructive', title: 'Error Deleting Category', description: description });
    } finally {
      setIsSubmitting(false);
    }
  };


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading categories...</p>
        </div>
      );
    }
    if (error) {
      return <p className="text-center text-destructive py-4">Error: {error}</p>;
    }
    if (categories.length === 0) {
      return <p className="text-muted-foreground text-center py-4">No categories found. Add one to get started!</p>;
    }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
                <Checkbox id="selectAllCategories" aria-label="Select all categories" />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                <Checkbox id={`select-category-${category.id}`} aria-label={`Select category ${category.name}`} />
              </TableCell>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell className="text-muted-foreground">{category.slug}</TableCell>
              <TableCell className="text-muted-foreground">
                {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Category Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(category)}>
                      <Edit2 className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCategoryToDelete(category)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground">Manage Categories</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddCategory}>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>Enter the name for the new category. A URL-friendly slug will be generated automatically.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input
                    id="category-name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Electronics"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Category
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

       {/* New Filter Bar for Categories */}
      <div className="p-4 bg-card rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1 sm:col-span-2 md:col-span-1">
            <label htmlFor="category-search" className="text-xs font-medium text-muted-foreground">Search Categories</label>
            <Input
              id="category-search"
              placeholder="Filter by category name..."
              value={categorySearchTerm}
              onChange={(e) => setCategorySearchTerm(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <Button onClick={() => setCategorySearchTerm('')} variant="outline" size="sm" className="h-9 text-sm">
             <FilterIcon className="mr-1.5 h-4 w-4" /> Reset Search
          </Button>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Category List</CardTitle>
          <CardDescription>View, add, edit, or delete product categories.</CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      {categoryToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
          setIsEditDialogOpen(isOpen);
          if (!isOpen) setCategoryToEdit(null);
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleEditSubmit}>
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogDescription>Update the name for the category "{categoryToEdit.name}".</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category-name">New Category Name</Label>
                  <Input
                    id="edit-category-name"
                    value={editedCategoryName}
                    onChange={(e) => setEditedCategoryName(e.target.value)}
                    placeholder="e.g., Electronics"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => {
                    setIsEditDialogOpen(false);
                    setCategoryToEdit(null);
                  }}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Category Confirmation Dialog */}
      {categoryToDelete && (
        <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the category "{categoryToDelete.name}".
                Products associated with this category will have their category unassigned.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCategoryToDelete(null)} disabled={isSubmitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteCategory} disabled={isSubmitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
