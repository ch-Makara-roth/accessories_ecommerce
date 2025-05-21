
// src/app/admin/users/page.tsx (for Customers)
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Edit, Trash2, Filter, ListFilter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

// Mock customer data for placeholder
const mockCustomers = [
  { id: 'usr1', name: 'Alice Wonderland', email: 'alice@example.com', joinDate: '2023-01-15', totalOrders: 5, totalSpent: '$250.00', status: 'Active' },
  { id: 'usr2', name: 'Bob The Builder', email: 'bob@example.com', joinDate: '2023-02-20', totalOrders: 2, totalSpent: '$95.50', status: 'Active' },
  { id: 'usr3', name: 'Charlie Brown', email: 'charlie@example.com', joinDate: '2023-03-10', totalOrders: 0, totalSpent: '$0.00', status: 'Inactive' },
  { id: 'usr4', name: 'Diana Prince', email: 'diana@example.com', joinDate: '2023-04-05', totalOrders: 12, totalSpent: '$1200.75', status: 'VIP' },
  { id: 'usr5', name: 'Edward Scissorhands', email: 'edward@example.com', joinDate: '2023-05-22', totalOrders: 1, totalSpent: '$30.00', status: 'Active' },
];


export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Customers</h1>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Customer
        </Button>
      </div>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Manage Customers</CardTitle>
          <CardDescription>View, edit, and manage your customer base.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search customers..." className="pl-8 w-full" />
            </div>
            <Button variant="outline">
              <ListFilter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"><Checkbox id="selectAllCustomers" /></TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Total Orders</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell><Checkbox id={`select-customer-${customer.id}`} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={`https://placehold.co/40x40.png?text=${customer.name.charAt(0)}`} alt={customer.name} data-ai-hint="avatar person" />
                          <AvatarFallback>{customer.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.joinDate}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{customer.totalOrders}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{customer.totalSpent}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        customer.status === 'Active' ? 'bg-green-100 text-green-700' :
                        customer.status === 'VIP' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {customer.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Customer Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Customer</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Placeholder for pagination */}
          <div className="flex items-center justify-between mt-6">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <span className="text-sm text-muted-foreground">Page 1 of 1</span>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
