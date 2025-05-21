import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Package, Clock, ShieldCheck } from 'lucide-react';

export default function DeliveryPage() {
  return (
    <div className="py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 text-primary">Delivery Information</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Truck className="mr-3 h-6 w-6 text-primary" /> Shipping Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/80">
            <p><strong>Standard Shipping:</strong> Typically arrives in 5-7 business days. Free on orders over $50.</p>
            <p><strong>Express Shipping:</strong> Arrives in 2-3 business days. Cost calculated at checkout.</p>
            <p><strong>Next-Day Shipping:</strong> Arrives next business day if ordered before 1 PM. Cost calculated at checkout.</p>
            <p className="text-sm text-muted-foreground">Shipping times may vary based on location and item availability.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Package className="mr-3 h-6 w-6 text-primary" /> Order Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/80">
            <p>Once your order is shipped, you will receive a tracking number via email. You can use this number to track your package on the carrier's website.</p>
            <p>You can also track your order status by logging into your <a href="/auth" className="text-primary hover:underline">account</a>.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Clock className="mr-3 h-6 w-6 text-primary" /> Delivery Times
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/80">
            <p>Deliveries are typically made Monday through Friday, excluding holidays.</p>
            <p>Weekend delivery may be available in select areas for an additional fee.</p>
            <p className="text-sm text-muted-foreground">Please note that delivery times are estimates and not guaranteed.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ShieldCheck className="mr-3 h-6 w-6 text-primary" /> Secure & Insured
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/80">
            <p>All our shipments are securely packaged to ensure your items arrive in perfect condition.</p>
            <p>Shipments are insured against loss or damage during transit.</p>
            <p>If you have any issues with your delivery, please <a href="/contact" className="text-primary hover:underline">contact our support team</a> immediately.</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center text-muted-foreground text-sm">
        <p>For any further questions regarding delivery, please visit our FAQ page or contact customer service.</p>
      </div>
    </div>
  );
}
