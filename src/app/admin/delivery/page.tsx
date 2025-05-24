
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Truck, CheckCircle, Loader2 } from 'lucide-react';
import type { OrderType } from '@/types';
import { Role, OrderStatus } from '@prisma/client';
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';

export default function AdminDeliveryPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchShippedOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all orders, then filter client-side for Shipped, or create a specific API endpoint
      const response = await fetch('/api/admin/orders'); 
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch orders for delivery and parse error' }));
        throw new Error(errorData.error || `Failed to fetch orders. Status: ${response.status}`);
      }
      const allOrders: OrderType[] = await response.json();
      setOrders(allOrders.filter(order => order.status === OrderStatus.Shipped));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast({ variant: 'destructive', title: 'Error Fetching Orders', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (session?.user?.role && [Role.ADMIN, Role.DELIVERY].includes(session.user.role as Role)) {
      fetchShippedOrders();
    }
  }, [session, fetchShippedOrders]);

  const handleMarkAsDelivered = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: OrderStatus.Delivered }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Failed to mark order as delivered. Status: ${response.status}`);
      }
      toast({ title: 'Order Delivered!', description: `Order #${orderId.substring(0,8)}... marked as Delivered.` });
      fetchShippedOrders(); // Re-fetch to update the list (shipped order will disappear)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({ variant: 'destructive', title: 'Error Updating Status', description: errorMessage });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading shipped orders...</p>
        </div>
      );
    }
    if (error) {
      return <p className="text-center text-destructive py-4">Error: {error}</p>;
    }
    if (orders.length === 0) {
      return <p className="text-muted-foreground text-center py-4">No orders currently awaiting delivery.</p>;
    }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date Shipped</TableHead> {/* Assuming updatedAt reflects shipped date for now */}
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium text-xs">#{order.id.substring(0, 8)}...</TableCell>
              <TableCell className="text-sm">
                {order.user?.name || order.user?.email || 'N/A'}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {/* For simplicity, using updatedAt. A dedicated shippedAt field would be better. */}
                {format(new Date(order.updatedAt), 'PP')} 
              </TableCell>
              <TableCell className="text-right font-semibold text-sm">${order.totalAmount.toFixed(2)}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{order.orderItems.length} item(s)</TableCell>
              <TableCell className="text-right">
                {updatingOrderId === order.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary inline-block" />
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                    onClick={() => handleMarkAsDelivered(order.id)}
                    disabled={updatingOrderId === order.id}
                  >
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Mark as Delivered
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground flex items-center">
          <Truck className="mr-3 h-7 w-7 text-primary" /> Delivery Management
        </h1>
      </div>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
             Shipped Orders
          </CardTitle>
          <CardDescription>View orders that have been shipped and mark them as delivered.</CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
