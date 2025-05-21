
import type { ObjectId } from 'mongodb';

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
  category: string;
  type?: string; // e.g., "Wireless", "Wired"
  color?: string;
  material?: string;
  offer?: string; // e.g., "50% Off"
  tags?: string[];
  dataAiHint?: string;
  stock?: number;
  status?: 'Active' | 'Draft' | 'Archived' | 'Scheduled'; // Added from admin form
};

export type Category = {
  id: string;
  name: string;
  icon?: React.ElementType;
  slug: string;
};

export interface CartItem {
  product: Product;
  quantity: number;
}
