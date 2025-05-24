
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, FileText, RotateCw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { OrderType, OrderItemType } from '@/types';
import { OrderStatus } from '@/types'; // Import OrderStatus from re-export in types
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { format } from 'date-fns';

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch orders.' }));
          throw new Error(errorData.error || `Failed to fetch orders. Status: ${response.status}`);
        }
        const data: OrderType[] = await response.json();
        setOrders(data);
      } catch (err) {
        console.error('Error fetching customer orders:', err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        toast({
          variant: 'destructive',
          title: 'Error Fetching Orders',
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  const getStatusColor = (status: OrderType['status']) => {
    switch (status) {
      case OrderStatus.Pending: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300';
      case OrderStatus.Processing: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
      case OrderStatus.Shipped: return 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300';
      case OrderStatus.Delivered: return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
      case OrderStatus.Cancelled: return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Orders</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

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

      {orders.length > 0 ? (
        orders.map(order => (
          <Card key={order.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}...</CardTitle>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                </span>
              </div>
              <CardDescription>
                Date: {format(new Date(order.createdAt), 'PPpp')} • Total: ${order.totalAmount.toFixed(2)} • {order.orderItems.length} item(s)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {order.orderItems.map((item: OrderItemType) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 border rounded-md bg-muted/50">
                    <Image
                      src={item.product.image || 'https://placehold.co/60x60.png'}
                      alt={item.product.name}
                      width={60}
                      height={60}
                      className="rounded object-cover aspect-square"
                       data-ai-hint={item.product.dataAiHint || 'product image'}
                    />
                    <div className="flex-grow">
                      <Link href={`/product/${item.product.id}`} className="font-medium hover:text-primary">{item.product.name}</Link>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity} • Price: ${item.price.toFixed(2)}</p>
                    </div>
                    <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between pt-3 border-t">
                 <p className="text-sm text-muted-foreground">User: {order.user?.name || order.user?.email || 'N/A'}</p>
                <div className="flex gap-2 mt-2 sm:mt-0">
                    <Button variant="outline" size="sm">
                        <FileText className="mr-1.5 h-4 w-4" /> View Invoice
                    </Button>
                    {order.status !== OrderStatus.Delivered && order.status !== OrderStatus.Cancelled && (
                        <Button variant="outline" size="sm">Track Order</Button>
                    )}
                    {order.status === OrderStatus.Delivered && (
                        <Button variant="secondary" size="sm">
                            <RotateCw className="mr-1.5 h-4 w-4" /> Reorder
                        </Button>
                    )}
                </div>
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
