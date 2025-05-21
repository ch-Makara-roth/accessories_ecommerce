
// src/app/account/orders/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, FileText, RotateCw } from 'lucide-react';
import Link from 'next/link';

const mockOrders = [
  { id: 'ORD12345', date: '2023-10-26', status: 'Shipped', total: 178.99, items: 2 },
  { id: 'ORD12340', date: '2023-10-15', status: 'Delivered', total: 89.50, items: 1 },
  { id: 'ORD12333', date: '2023-09-30', status: 'Processing', total: 250.00, items: 3 },
];

export default function CustomerOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground flex items-center">
          <Package className="mr-3 h-7 w-7 text-primary" />
          My Orders
        </h1>
         <Button asChild>
            <Link href="/">Continue Shopping</Link>
        </Button>
      </div>

      {mockOrders.length > 0 ? (
        mockOrders.map(order => (
          <Card key={order.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <CardTitle className="text-lg">Order {order.id}</CardTitle>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                }`}>
                    {order.status}
                </span>
              </div>
              <CardDescription>Date: {order.date} • Total: ${order.total.toFixed(2)} • {order.items} item(s)</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              {/* Placeholder for item preview or simple description */}
              <p className="text-sm text-muted-foreground">Items include: Wireless Earbuds, Charging Cable...</p>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <Button variant="outline" size="sm">
                    <FileText className="mr-1.5 h-4 w-4" /> View Invoice
                </Button>
                {order.status !== 'Delivered' && (
                    <Button variant="outline" size="sm">Track Order</Button>
                )}
                {order.status === 'Delivered' && (
                     <Button variant="secondary" size="sm">
                        <RotateCw className="mr-1.5 h-4 w-4" /> Reorder
                    </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
            <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground text-lg">You haven't placed any orders yet.</p>
                <Button className="mt-4" asChild>
                    <Link href="/">Start Shopping</Link>
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
