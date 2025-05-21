
'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, MinusCircle, PlusCircle } from 'lucide-react';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartItemCount } = useCart();

  if (getCartItemCount() === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4 text-primary">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 text-primary">Your Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map(item => (
            <Card key={item.product.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 shadow-md">
              <Link href={`/product/${item.product.id}`} className="shrink-0">
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  width={100}
                  height={100}
                  className="rounded-md object-cover aspect-square"
                  data-ai-hint={item.product.dataAiHint || 'product image'}
                />
              </Link>
              <div className="flex-grow sm:text-left text-center">
                <Link href={`/product/${item.product.id}`}>
                  <h2 className="text-lg font-semibold hover:text-primary">{item.product.name}</h2>
                </Link>
                <p className="text-sm text-muted-foreground">Unit Price: ${item.product.price.toFixed(2)}</p>
                 <div className="flex items-center justify-center sm:justify-start space-x-2 my-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center font-medium text-lg">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-center sm:text-right ml-auto">
                <p className="text-lg font-semibold text-primary mb-2">${(item.product.price * item.quantity).toFixed(2)}</p>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/80" onClick={() => removeFromCart(item.product.id)}>
                  <Trash2 className="mr-1 h-4 w-4" /> Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal ({getCartItemCount()} items)</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-primary font-semibold">FREE</span> {/* Or calculate shipping */}
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/">Continue Shopping</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

