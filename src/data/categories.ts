import type { Category } from '@/types';
import { Headphones, HomeIcon as FurnitureIcon, Footprints as ShoesIcon, Laptop, Briefcase as BagIcon, BookOpen } from 'lucide-react'; // Using HomeIcon for Furniture as placeholder

export const popularCategories: Category[] = [
  { id: 'cat1', name: 'Furniture', icon: FurnitureIcon, slug: 'furniture' },
  { id: 'cat2', name: 'Headphones', icon: Headphones, slug: 'headphones' },
  { id: 'cat3', name: 'Shoes', icon: ShoesIcon, slug: 'shoes' },
  { id: 'cat4', name: 'Laptops', icon: Laptop, slug: 'laptops' },
  { id: 'cat5', name: 'Bags', icon: BagIcon, slug: 'bags' },
  { id: 'cat6', name: 'Books', icon: BookOpen, slug: 'books' },
];
