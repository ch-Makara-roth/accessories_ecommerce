
import type { Role, OrderStatus as PrismaOrderStatusEnum } from '@prisma/client'; // Import Prisma enum
import type { ObjectId } from 'mongodb';

// Re-export Prisma's OrderStatus enum for consistent use
export { Role, PrismaOrderStatusEnum as OrderStatus };

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

// OrderType now uses the re-exported PrismaOrderStatusEnum
export type OrderType = {
  id: string;
  userId: string;
  user?: { name?: string | null; email?: string | null };
  totalAmount: number;
  status: PrismaOrderStatusEnum; // Use the imported enum type
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
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | string | null;
  image?: string | null;
  role?: Role;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
