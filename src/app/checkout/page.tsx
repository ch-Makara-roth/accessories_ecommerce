
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation'; // For redirecting
import { MinusCircle, PlusCircle, Trash2 } from 'lucide-react';

export default function CheckoutPage() {
  const { cartItems, getCartTotal, getCartItemCount, clearCart, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();

  const shipping = 0.00; // Example free shipping
  const subtotal = getCartTotal();
  const total = subtotal + shipping;

  const handlePlaceOrder = () => {
    // In a real app, this would submit to a backend
    alert('Order Placed! (This is a demo)');
    clearCart(); // Clear cart after "placing order"
    router.push('/'); // Redirect to homepage
  };

  if (getCartItemCount() === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4 text-primary">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">You need to add items to your cart before you can checkout.</p>
        <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 text-primary">Checkout</h1>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Delivery & Payment Information */}
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" required/>
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" required/>
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="123 Main St" required/>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Anytown" required/>
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" placeholder="CA" required/>
                </div>
                <div>
                  <Label htmlFor="zip">Zip Code</Label>
                  <Input id="zip" placeholder="90210" required/>
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="(555) 123-4567" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" placeholder="•••• •••• •••• ••••" required/>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input id="expiryDate" placeholder="MM/YY" required/>
                </div>
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" required/>
                </div>
              </div>
               <div className="flex items-center space-x-2 mt-2">
                {/* Placeholder for payment icons */}
                <span className="text-sm">We accept:</span>
                <div className="border border-border rounded px-2 py-1 text-xs text-muted-foreground">Visa</div>
                <div className="border border-border rounded px-2 py-1 text-xs text-muted-foreground">Mastercard</div>
                <div className="border border-border rounded px-2 py-1 text-xs text-muted-foreground">Amex</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 overflow-y-auto space-y-4 mb-4 pr-2"> {/* Increased max-h */}
                {cartItems.map(item => (
                  <div key={item.product.id} className="flex flex-col space-y-3 pb-3 border-b last:border-b-0">
                    <div className="flex items-start space-x-3">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        width={60} 
                        height={60}
                        className="rounded-md object-cover aspect-square"
                        data-ai-hint={item.product.dataAiHint || 'product image'}
                      />
                      <div className="flex-grow">
                        <Link href={`/product/${item.product.id}`} className="hover:text-primary">
                          <p className="font-semibold text-sm leading-tight">{item.product.name}</p>
                        </Link>
                        <p className="text-xs text-muted-foreground">Unit Price: ${item.product.price.toFixed(2)}</p>
                        <p className="font-semibold text-sm mt-1">${(item.product.price * item.quantity).toFixed(2)}</p>
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
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/80 text-xs px-2 py-1" onClick={() => removeFromCart(item.product.id)}>
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <Separator className="my-2"/>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-3">
              <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={handlePlaceOrder}>
                Place Order
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/cart">Edit Cart</Link>
              </Button>
              <Button variant="link" className="w-full text-sm" asChild>
                <Link href="/">Continue Shopping</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
