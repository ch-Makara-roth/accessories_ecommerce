
import { Role as PrismaRole, OrderStatus as PrismaOrderStatus } from '@prisma/client';
import type { ObjectId } from 'mongodb';

// Re-export Prisma's enums. This makes them available as both values and types.
export { PrismaRole as Role, PrismaOrderStatus as OrderStatus };


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

export type OrderType = {
  id: string;
  userId: string;
  user?: { name?: string | null; email?: string | null };
  totalAmount: number;
  status: PrismaOrderStatus; // Use the re-exported enum type
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

export type User = {
  id:string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | string | null;
  image?: string | null;
  role?: PrismaRole; // Use the re-exported enum type
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
