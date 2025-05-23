
import type { ObjectId } from 'mongodb';

export type Category = {
  id: string;
  _id?: ObjectId | string; // MongoDB ID, if needed directly
  name: string;
  slug: string;
  icon?: React.ElementType; 
  createdAt?: Date;
  updatedAt?: Date;
};

export type Product = {
  _id?: ObjectId | string; 
  id: string; 
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount?: number;
  description: string;
  image: string;
  
  type?: string; 
  color?: string;
  material?: string;
  offer?: string; 
  tags?: string[];
  dataAiHint?: string;
  stock?: number;
  status?: 'Active' | 'Draft' | 'Archived' | 'Scheduled'; 

  categoryId?: string | null; 
  category?: Category | null; 
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
  product: Product; 
  quantity: number;
  price: number; 
  createdAt?: Date;
  updatedAt?: Date;
};

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export type OrderType = {
  id: string;
  userId: string;
  user?: { name?: string | null; email?: string | null }; 
  totalAmount: number;
  status: OrderStatus;
  shippingAddress?: any; 
  createdAt: Date;
  updatedAt: Date;
  orderItems: OrderItemType[];
};

export type AdminNotification = {
  id: string;
  title: string;
  description: string;
  category: string; // e.g., "New Order", "Low Stock", "User Signup"
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
