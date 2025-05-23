
'use client';

import Link from 'next/link';
import type { Category } from '@/types'; // Ensure Category type is imported
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Tag } from 'lucide-react'; // Using Tag as a generic icon

const PopularCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchPopularCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/categories?limit=6'); // Example: fetch top 6 popular categories
      if (!response.ok) {
        throw new Error('Failed to fetch popular categories');
      }
      const data: Category[] = await response.json();
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching popular categories for sidebar:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load popular categories.' });
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPopularCategories();
  }, [fetchPopularCategories]);


  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Popular Categories</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : categories.length > 0 ? (
          <ul className="space-y-2">
            {categories.map(category => (
              <li key={category.id}>
                <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-accent/20 hover:text-primary" asChild>
                  <Link href={`/category/${category.slug}`} className="flex items-center space-x-2">
                    {/* Use a generic icon or implement dynamic icons based on category name/slug if needed */}
                    <Tag className="h-5 w-5 text-primary/80" /> 
                    <span>{category.name}</span>
                  </Link>
                </Button>
              </li>
            ))}
             <li>
                <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-accent/20 hover:text-primary font-semibold" asChild>
                  <Link href="/category/all">
                    View All Categories &rarr;
                  </Link>
                </Button>
              </li>
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">No popular categories to display right now.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default PopularCategories;
