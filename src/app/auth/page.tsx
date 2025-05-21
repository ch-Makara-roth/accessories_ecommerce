
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, Chrome, Facebook } from 'lucide-react'; // Added Chrome and Facebook icons
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const router = useRouter();

  const handleAdminLogin = () => {
    // In a real app, this would trigger an admin-specific authentication flow.
    // For now, it will just redirect to the admin dashboard.
    router.push('/admin');
  };

  const handleCustomerLogin = () => {
    // In a real app, this would trigger a customer authentication flow.
    // For now, it will just redirect to the customer account dashboard.
    router.push('/account');
  };

  const handleCustomerSignup = () => {
    // In a real app, this would trigger a customer signup flow.
    // For now, it will just redirect to the customer account dashboard.
    router.push('/account');
  }

  return (
    <div className="flex flex-col justify-center items-center py-12 min-h-[calc(100vh-200px)] gap-10">
      {/* Customer Auth Section */}
      <Tabs defaultValue="login" className="w-full max-w-md" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Customer Login</TabsTrigger>
          <TabsTrigger value="signup">Customer Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Customer Login</CardTitle>
              <CardDescription>Enter your email below to login to your customer account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-login">Email</Label>
                <Input id="email-login" type="email" placeholder="m@example.com" required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="password-login">Password</Label>
                  <Link href="#" className="ml-auto inline-block text-sm underline text-muted-foreground hover:text-primary">
                    Forgot your password?
                  </Link>
                </div>
                <Input id="password-login" type="password" required />
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <Button variant="outline" className="w-full" onClick={() => alert('Google Login (Placeholder)')}>
                  <Chrome className="mr-2 h-4 w-4" /> Login with Google
                </Button>
                <Button variant="outline" className="w-full" onClick={() => alert('Facebook Login (Placeholder)')}>
                  <Facebook className="mr-2 h-4 w-4" /> Login with Facebook
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" onClick={handleCustomerLogin}>Login</Button>
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Button variant="link" className="p-0 h-auto text-primary" onClick={() => setActiveTab('signup')}>
                  Sign up
                </Button>
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Customer Sign Up</CardTitle>
              <CardDescription>Enter your information to create a customer account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input id="first-name" placeholder="Max" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input id="last-name" placeholder="Robinson" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input id="email-signup" type="email" placeholder="m@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">Password</Label>
                <Input id="password-signup" type="password" required />
              </div>
               <Separator className="my-4" />
              <div className="space-y-2">
                <Button variant="outline" className="w-full" onClick={() => alert('Google Signup (Placeholder)')}>
                  <Chrome className="mr-2 h-4 w-4" /> Sign up with Google
                </Button>
                <Button variant="outline" className="w-full" onClick={() => alert('Facebook Signup (Placeholder)')}>
                  <Facebook className="mr-2 h-4 w-4" /> Sign up with Facebook
                </Button>
              </div>
            </CardContent>
             <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" onClick={handleCustomerSignup}>Create account</Button>
               <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Button variant="link" className="p-0 h-auto text-primary" onClick={() => setActiveTab('login')}>
                  Login
                </Button>
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Admin Login Section Separator and Card */}
      <div className="w-full max-w-md">
        <div className="flex items-center my-4">
          <Separator className="flex-grow" />
          <span className="mx-4 text-sm text-muted-foreground">Or</span>
          <Separator className="flex-grow" />
        </div>
        <Card className="border-primary/50 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="text-center">
            <CardTitle className="text-xl flex items-center justify-center">
              <ShieldCheck className="mr-2 h-6 w-6 text-primary" />
              Admin Access
            </CardTitle>
            <CardDescription>For authorized personnel only.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center mb-4">
              If you are an administrator, please use the admin login.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAdminLogin}>
              Login as Admin
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
