import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

const CheckoutPreview = () => {
  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Checkout</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
            <Input id="name" placeholder="John Doe" className="mt-1"/>
          </div>
          <div>
            <Label htmlFor="address" className="text-sm font-medium">Address</Label>
            <Input id="address" placeholder="123 Main St" className="mt-1"/>
          </div>
          <div>
            <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
            <Input id="phone" placeholder="(555) 123-4567" className="mt-1"/>
          </div>
        </div>
        <Separator className="my-4" />
        <h4 className="text-md font-semibold mb-2 text-foreground">Order Summary</h4>
        <div className="flex items-center space-x-3 p-2 bg-muted/50 rounded-md">
          <Image src="https://placehold.co/64x64.png" alt="Airpods Max" width={48} height={48} className="rounded" data-ai-hint="airpods max" />
          <div>
            <p className="text-sm font-medium text-foreground">Airpods Max</p>
            <p className="text-sm text-primary font-semibold">$159.00+</p>
          </div>
        </div>
        <Separator className="my-4" />
        <h4 className="text-md font-semibold mb-2 text-foreground">Payment Options</h4>
        <div className="flex space-x-2">
          {/* Placeholder for payment icons */}
          <div className="border border-border rounded px-2 py-1 text-xs text-muted-foreground">Visa</div>
          <div className="border border-border rounded px-2 py-1 text-xs text-muted-foreground">Mastercard</div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Place Order</Button>
      </CardFooter>
    </Card>
  );
};

export default CheckoutPreview;
