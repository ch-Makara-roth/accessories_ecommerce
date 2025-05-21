
// src/app/account/settings/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { User, Lock, Mail, MapPin, Bell, Save } from 'lucide-react';

export default function CustomerSettingsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground flex items-center">
            <User className="mr-3 h-7 w-7 text-primary" />
            Account Settings
        </h1>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>

      {/* Profile Information */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <User className="mr-3 h-5 w-5 text-primary" /> Profile Information
          </CardTitle>
          <CardDescription>Manage your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="John" defaultValue="John" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Doe" defaultValue="Doe" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="john.doe@example.com" defaultValue="john.doe@example.com" disabled />
             <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input id="phone" type="tel" placeholder="+1234567890" />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Change Password */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Lock className="mr-3 h-5 w-5 text-primary" /> Change Password
          </CardTitle>
          <CardDescription>Update your account password.</CardDescription>
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
      
      <Separator />
      
      {/* Addresses */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <MapPin className="mr-3 h-5 w-5 text-primary" /> Manage Addresses
          </CardTitle>
          <CardDescription>Add or edit your shipping addresses.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-muted-foreground">No addresses saved yet.</p>
            <Button variant="outline" size="sm">Add New Address</Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Notification Preferences */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Bell className="mr-3 h-5 w-5 text-primary" /> Notification Preferences
          </CardTitle>
          <CardDescription>Choose how you receive communications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="emailPromotions">Receive promotional emails</Label>
            <Switch id="emailPromotions" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="orderUpdates">Order status updates via email</Label>
            <Switch id="orderUpdates" defaultChecked />
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
