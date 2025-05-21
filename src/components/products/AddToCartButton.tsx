
'use client';

import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';
import { ShoppingCart } from 'lucide-react';
import type { ButtonProps } from '@/components/ui/button'; // Import ButtonProps

interface AddToCartButtonProps extends Omit<ButtonProps, 'onClick'> { // Omit onClick as it's handled internally
  product: Product;
  children?: React.ReactNode;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product, children, ...buttonProps }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <Button onClick={handleAddToCart} {...buttonProps}>
      {children || (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </>
      )}
    </Button>
  );
};

export default AddToCartButton;
