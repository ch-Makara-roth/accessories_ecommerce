
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Users, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { User as UserType } from '@/types'; // Assuming User type includes role
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client'; // Import Role enum for dropdown and comparison
import { format } from 'date-fns';

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // State to manage which user's role is currently being edited
  const [editingRoleUserId, setEditingRoleUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSubmittingRoleChange, setIsSubmittingRoleChange] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch users and parse error' }));
        throw new Error(errorData.error || `Failed to fetch users. Status: ${response.status}`);
      }
      const data: UserType[] = await response.json();
      setUsers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast({ variant: 'destructive', title: 'Error Fetching Users', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (session?.user?.role === Role.ADMIN) {
      fetchUsers();
    }
  }, [session, fetchUsers]);

  const handleRoleChange = (userId: string, newRole: Role) => {
    setEditingRoleUserId(userId);
    setSelectedRole(newRole);
  };

  const saveRoleChange = async (userId: string) => {
    if (!selectedRole || !editingRoleUserId || editingRoleUserId !== userId) return;

    setIsSubmittingRoleChange(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Failed to update role. Status: ${response.status}`);
      }
      toast({ title: 'Role Updated!', description: `User's role has been updated to ${selectedRole}.` });
      fetchUsers(); // Refresh user list
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({ variant: 'destructive', title: 'Error Updating Role', description: errorMessage });
    } finally {
      setEditingRoleUserId(null);
      setSelectedRole(null);
      setIsSubmittingRoleChange(false);
    }
  };

  const getRoleColor = (role?: Role) => {
    switch (role) {
      case Role.ADMIN: return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
      case Role.SELLER: return 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300';
      case Role.STOCK: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300';
      case Role.CUSTOMER: return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300';
    }
  };


  if (session?.user?.role !== Role.ADMIN && !isLoading) {
    return (
        <Card className="shadow-md mt-6">
            <CardHeader>
                <CardTitle className="flex items-center text-xl text-destructive">
                    <AlertTriangle className="mr-2 h-5 w-5" /> Access Denied
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">You do not have permission to view this page.</p>
            </CardContent>
        </Card>
    );
  }


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading users...</p>
        </div>
      );
    }
    if (error) {
      return <p className="text-center text-destructive py-4">Error: {error}</p>;
    }
    if (users.length === 0) {
      return <p className="text-muted-foreground text-center py-4">No users found.</p>;
    }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Current Role</TableHead>
            <TableHead>Email Verified</TableHead>
            <TableHead>Joined At</TableHead>
            <TableHead className="text-right w-[250px]">Change Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getRoleColor(user.role)}`}>
                  {user.role || 'N/A'}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {user.emailVerified ? format(new Date(user.emailVerified), 'PP') : 'No'}
              </TableCell>
               <TableCell className="text-muted-foreground">
                {user.createdAt ? format(new Date(user.createdAt), 'PP') : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                {session?.user?.id === user.id ? (
                  <span className="text-xs text-muted-foreground italic">Cannot change own role</span>
                ) : (
                  <div className="flex items-center justify-end gap-2">
                    <Select
                      value={editingRoleUserId === user.id ? selectedRole ?? user.role : user.role}
                      onValueChange={(newRole) => handleRoleChange(user.id, newRole as Role)}
                      disabled={isSubmittingRoleChange && editingRoleUserId === user.id}
                    >
                      <SelectTrigger className="h-8 text-xs w-[130px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Role).map((roleEnum) => (
                          <SelectItem key={roleEnum} value={roleEnum} className="text-xs">
                            {roleEnum}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {editingRoleUserId === user.id && (
                      <Button 
                        size="sm" 
                        onClick={() => saveRoleChange(user.id)} 
                        disabled={isSubmittingRoleChange || !selectedRole || selectedRole === user.role}
                        className="h-8 text-xs"
                      >
                        {isSubmittingRoleChange ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
                      </Button>
                    )}
                  </div>
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
          <Users className="mr-3 h-7 w-7 text-primary" /> User Management
        </h1>
        {/* Add New User Button can be added here if needed later */}
      </div>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5 text-primary" /> All Users
          </CardTitle>
          <CardDescription>View and manage user roles. Admins cannot change their own role here.</CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
