
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
  createdAt?: Date;
  updatedAt?: Date;
};


export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderItemType = {
  id: string;
  productId: string;
  product: Product; // Include product details for display
  quantity: number;
  price: number; // Price at the time of order
  createdAt?: Date;
  updatedAt?: Date;
};

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export type OrderType = {
  id: string;
  userId: string;
  user?: { name?: string | null; email?: string | null }; // Optional user details
  totalAmount: number;
  status: OrderStatus;
  shippingAddress?: any; // Define a proper type if you have a structured address
  createdAt: Date;
  updatedAt: Date;
  orderItems: OrderItemType[];
};
