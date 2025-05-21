
'use client';

import type { Product, CartItem } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const addToCart = useCallback((product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { product, quantity: 1 }];
    });
    toast({
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`,
    });
  }, [toast]);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.product.id === productId);
      if (itemToRemove) {
        toast({
          title: "Item Removed",
          description: `${itemToRemove.product.name} has been removed from your cart.`,
          variant: "destructive",
        });
      }
      return prevItems.filter(item => item.product.id !== productId);
    });
  }, [toast]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart.",
    });
  }, [toast]);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [cartItems]);

  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartItemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
