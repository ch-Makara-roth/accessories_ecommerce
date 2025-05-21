
// src/app/admin/settings/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, CreditCard, Truck, PercentSquare, BellRing, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="mr-2 h-4 w-4" /> Save All Settings
        </Button>
      </div>

      {/* Store Information */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Building className="mr-3 h-5 w-5 text-primary" /> Store Information
          </CardTitle>
          <CardDescription>Manage your store's basic details and branding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input id="storeName" placeholder="Your Awesome Store" defaultValue="Audio Emporium" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeEmail">Contact Email</Label>
              <Input id="storeEmail" type="email" placeholder="contact@examplestore.com" defaultValue="support@audioemporium.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="storeAddress">Store Address</Label>
            <Input id="storeAddress" placeholder="123 Main St, Anytown, USA" defaultValue="456 Sound Ave, Music City, USA" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="storeLogo">Store Logo URL</Label>
            <Input id="storeLogo" placeholder="https://example.com/logo.png" />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Payment Gateways */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <CreditCard className="mr-3 h-5 w-5 text-primary" /> Payment Gateways
          </CardTitle>
          <CardDescription>Configure how you accept payments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
            <Label htmlFor="stripeEnabled" className="flex items-center text-sm font-medium">
              Stripe
            </Label>
            <Switch id="stripeEnabled" defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
            <Label htmlFor="paypalEnabled" className="flex items-center text-sm font-medium">
              PayPal
            </Label>
            <Switch id="paypalEnabled" />
          </div>
          <Button variant="outline" size="sm">Manage Payment Settings</Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Shipping Options */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Truck className="mr-3 h-5 w-5 text-primary" /> Shipping Options
          </CardTitle>
          <CardDescription>Set up your shipping zones and rates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultShippingRate">Default Shipping Rate ($)</Label>
            <Input id="defaultShippingRate" type="number" placeholder="5.00" defaultValue="4.99" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="freeShippingThreshold">Free Shipping Threshold ($)</Label>
            <Input id="freeShippingThreshold" type="number" placeholder="50" defaultValue="75" />
          </div>
          <Button variant="outline" size="sm">Configure Shipping Zones</Button>
        </CardContent>
      </Card>
      
      <Separator />

      {/* Tax Configuration */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <PercentSquare className="mr-3 h-5 w-5 text-primary" /> Tax Configuration
          </CardTitle>
          <CardDescription>Manage tax rates and settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="autoTax" defaultChecked />
            <Label htmlFor="autoTax">Automatically calculate taxes</Label>
          </div>
          <Button variant="outline" size="sm">Set Up Tax Regions</Button>
        </CardContent>
      </Card>
      
      <Separator />

      {/* Notification Preferences */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <BellRing className="mr-3 h-5 w-5 text-primary" /> Notification Preferences
          </CardTitle>
          <CardDescription>Choose which admin notifications you want to receive.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="newOrderNotifications">New Order Notifications</Label>
            <Switch id="newOrderNotifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="lowStockNotifications">Low Stock Alerts</Label>
            <Switch id="lowStockNotifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="newCustomerNotifications">New Customer Sign-ups</Label>
            <Switch id="newCustomerNotifications" />
          </div>
           <div className="space-y-2">
              <Label htmlFor="notificationEmail">Send notifications to:</Label>
              <Input id="notificationEmail" type="email" placeholder="admin@example.com" defaultValue="admin@audioemporium.com" />
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
