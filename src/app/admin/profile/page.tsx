
// src/app/admin/profile/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Lock, Image as ImageIcon, Save } from 'lucide-react';

export default function AdminProfilePage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground flex items-center">
            <User className="mr-3 h-7 w-7 text-primary" />
            Admin Profile
        </h1>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>

      {/* Profile Information */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <User className="mr-3 h-5 w-5 text-primary" /> Account Details
          </CardTitle>
          <CardDescription>Manage your administrator account information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src="https://placehold.co/100x100.png?text=Admin" alt="Admin" data-ai-hint="avatar person" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
                <Button variant="outline" size="sm">
                    <ImageIcon className="mr-2 h-4 w-4" /> Change Picture
                </Button>
                <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 800K</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="adminName">Full Name</Label>
              <Input id="adminName" placeholder="Admin User" defaultValue="Admin User" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email Address</Label>
              <Input id="adminEmail" type="email" placeholder="admin@example.com" defaultValue="admin@audioemporium.com" disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Lock className="mr-3 h-5 w-5 text-primary" /> Change Password
          </CardTitle>
          <CardDescription>Update your account password securely.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" />
            </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
