
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
import { Package, CheckCircle, Truck, Loader2 } from 'lucide-react';
import type { OrderType } from '@/types';
import { OrderStatus } from '@/types'; // Import OrderStatus from re-export in types
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client';
import { format } from 'date-fns';

export default function AdminOrderManagementPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchOrdersForAdmin = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch orders for admin and parse error' }));
        throw new Error(errorData.error || `Failed to fetch orders. Status: ${response.status}`);
      }
      const data: OrderType[] = await response.json();
      setOrders(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast({ variant: 'destructive', title: 'Error Fetching Orders', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (session?.user?.role && [Role.ADMIN, Role.SELLER].includes(session.user.role as Role)) {
      fetchOrdersForAdmin();
    }
  }, [session, fetchOrdersForAdmin]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Failed to update order status. Status: ${response.status}`);
      }
      toast({ title: 'Order Status Updated!', description: `Order #${orderId.substring(0,8)}... moved to ${newStatus}.` });
      fetchOrdersForAdmin();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({ variant: 'destructive', title: 'Error Updating Status', description: errorMessage });
    } finally {
      setUpdatingOrderId(null);
    }
  };

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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading orders...</p>
        </div>
      );
    }
    if (error) {
      return <p className="text-center text-destructive py-4">Error: {error}</p>;
    }
    if (orders.length === 0) {
      return <p className="text-muted-foreground text-center py-4">No orders found.</p>;
    }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Status</TableHead>
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
                {format(new Date(order.createdAt), 'PP')}
              </TableCell>
              <TableCell className="text-right font-semibold text-sm">${order.totalAmount.toFixed(2)}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{order.orderItems.length} item(s)</TableCell>
              <TableCell>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                {updatingOrderId === order.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary inline-block" />
                ) : (
                  <>
                    {order.status === OrderStatus.Pending && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={() => handleUpdateOrderStatus(order.id, OrderStatus.Processing)}
                        disabled={updatingOrderId === order.id}
                      >
                        <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Accept
                      </Button>
                    )}
                    {order.status === OrderStatus.Processing && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => handleUpdateOrderStatus(order.id, OrderStatus.Shipped)}
                        disabled={updatingOrderId === order.id}
                      >
                         <Truck className="mr-1.5 h-3.5 w-3.5" /> Mark Shipped
                      </Button>
                    )}
                  </>
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
          <Package className="mr-3 h-7 w-7 text-primary" /> Order Management
        </h1>
      </div>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
             All Orders
          </CardTitle>
          <CardDescription>View and manage customer orders. Accept pending orders and mark them as shipped.</CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
