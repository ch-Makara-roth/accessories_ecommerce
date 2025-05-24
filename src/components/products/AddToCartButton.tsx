
'use client';

import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';
import { ShoppingCart } from 'lucide-react';
import type { ButtonProps } from '@/components/ui/button'; 

interface AddToCartButtonProps extends Omit<ButtonProps, 'onClick' | 'disabled'> { 
  product: Product;
  children?: React.ReactNode;
  disabled?: boolean; // Make disabled prop explicit
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product, children, disabled, ...buttonProps }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (disabled) return; // Prevent action if disabled
    addToCart(product);
  };

  return (
    <Button onClick={handleAddToCart} disabled={disabled} {...buttonProps}>
      {children || (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </>
      )}
    </Button>
  );
};

export default AddToCartButton;
