
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, MinusCircle, PlusCircle, Trash2 } from 'lucide-react';

const CheckoutPreview = () => {
  const { cartItems, getCartTotal, getCartItemCount, updateQuantity, removeFromCart } = useCart();
  const itemCount = getCartItemCount();
  const cartTotal = getCartTotal();

  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" /> Cart Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0"> {/* Adjusted padding for scroll area */}
        {itemCount === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">Your cart is empty.</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[200px] w-full pr-3 mb-3"> {/* Max height and scroll */}
              <div className="space-y-3">
                {cartItems.map(item => (
                  <div key={item.product.id} className="flex flex-col space-y-2 pb-2 border-b last:border-b-0">
                    <div className="flex items-start space-x-3">
                      <Link href={`/product/${item.product.id}`} className="shrink-0">
                        <Image 
                          src={item.product.image} 
                          alt={item.product.name} 
                          width={56} // Slightly larger image
                          height={56} 
                          className="rounded-md object-cover aspect-square" 
                          data-ai-hint={item.product.dataAiHint || 'product image'}
                        />
                      </Link>
                      <div className="flex-grow">
                        <Link href={`/product/${item.product.id}`} className="hover:text-primary">
                          <p className="text-sm font-semibold leading-tight line-clamp-2">{item.product.name}</p>
                        </Link>
                        <p className="text-sm text-primary font-bold mt-1">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                          <MinusCircle className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                          <PlusCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/80 text-xs px-2 py-1 h-7" onClick={() => removeFromCart(item.product.id)}>
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator className="my-3" />
            <div className="flex justify-between text-md font-semibold mb-1">
              <span>Subtotal ({itemCount} items):</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-0">
        {itemCount > 0 ? (
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" asChild>
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>
        ) : (
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" asChild>
            <Link href="/">Start Shopping</Link>
          </Button>
        )}
         {itemCount > 0 && (
            <Button variant="outline" className="w-full" asChild>
                <Link href="/cart">View Full Cart</Link>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CheckoutPreview;
