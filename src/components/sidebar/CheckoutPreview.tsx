
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';

const CheckoutPreview = () => {
  const { cartItems, getCartTotal, getCartItemCount } = useCart();
  const itemCount = getCartItemCount();
  const cartTotal = getCartTotal();
  const firstItem = cartItems.length > 0 ? cartItems[0] : null;

  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" /> Cart Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {itemCount === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">Your cart is empty.</p>
          </div>
        ) : (
          <>
            <h4 className="text-md font-semibold mb-2 text-foreground">Your Items ({itemCount})</h4>
            {firstItem && (
              <div className="flex items-center space-x-3 p-2 bg-muted/50 rounded-md mb-3">
                <Image 
                  src={firstItem.product.image} 
                  alt={firstItem.product.name} 
                  width={48} 
                  height={48} 
                  className="rounded" 
                  data-ai-hint={firstItem.product.dataAiHint || 'product image'}
                />
                <div>
                  <p className="text-sm font-medium text-foreground truncate max-w-[150px]">{firstItem.product.name}</p>
                  <p className="text-sm text-primary font-semibold">${firstItem.product.price.toFixed(2)}</p>
                  {itemCount > 1 && <p className="text-xs text-muted-foreground">...and {itemCount -1} more item(s)</p>}
                </div>
              </div>
            )}
            <Separator className="my-3" />
            <div className="flex justify-between text-md font-semibold mb-3">
              <span>Subtotal:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <h4 className="text-md font-semibold mb-2 text-foreground">Payment Options</h4>
            <div className="flex space-x-2">
              {/* Placeholder for payment icons */}
              <div className="border border-border rounded px-2 py-1 text-xs text-muted-foreground">Visa</div>
              <div className="border border-border rounded px-2 py-1 text-xs text-muted-foreground">Mastercard</div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {itemCount > 0 ? (
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" asChild>
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>
        ) : (
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" asChild>
            <Link href="/">Start Shopping</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CheckoutPreview;
