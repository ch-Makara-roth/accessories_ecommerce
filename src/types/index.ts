
import type { ObjectId } from 'mongodb';

export type Category = {
  id: string;
  _id?: ObjectId | string; // MongoDB ID, if needed directly
  name: string;
  slug: string;
  icon?: React.ElementType; // Kept for potential future use, not directly in DB model for now
  createdAt?: Date;
  updatedAt?: Date;
};

export type Product = {
  _id?: ObjectId | string; // MongoDB ID
  id: string; // string version of _id, for client-side use
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount?: number;
  description: string;
  image: string;
  
  type?: string; // e.g., "Wireless", "Wired"
  color?: string;
  material?: string;
  offer?: string; // e.g., "50% Off"
  tags?: string[];
  dataAiHint?: string;
  stock?: number;
  status?: 'Active' | 'Draft' | 'Archived' | 'Scheduled'; // Added from admin form

  categoryId?: string | null; // Foreign key
  category?: Category | null; // Nested category object
};


export interface CartItem {
  product: Product;
  quantity: number;
}
