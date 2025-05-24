
import type { Role } from '@prisma/client'; // Import Role enum from Prisma
import type { ObjectId } from 'mongodb';

export type Category = {
  id: string;
  _id?: ObjectId | string; 
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
  category: string; 
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

// Define a more complete User type for frontend use, especially for admin user management
export type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | string | null; // Prisma returns Date, NextAuth might use string initially
  image?: string | null;
  role?: Role; // Use the Prisma Role enum
  createdAt?: Date | string;
  updatedAt?: Date | string;
  // Exclude password or other sensitive fields that shouldn't be on the client
};
