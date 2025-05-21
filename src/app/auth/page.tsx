
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { useState, type FormEvent, useEffect } from 'react'; // Added useEffect
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, Chrome, Facebook, Mail, KeyRound } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpRequested, setIsOtpRequested] = useState(false);


  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (errorParam) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: errorParam === 'CredentialsSignin' ? 'Invalid email or password.' : errorParam,
      });
      // Optional: remove error from URL after displaying
      router.replace('/auth', undefined); 
    }
  }, [errorParam, toast, router]);


  if (status === 'authenticated') {
    router.push('/account');
    return <div className="text-center py-10">Loading account details...</div>;
  }

  const handleAdminLogin = () => {
    // For now, direct navigation. In a real app, this might have its own auth flow.
    router.push('/admin');
  };

  const handleCustomerEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await signIn('credentials', {
      redirect: false, // Handle redirect manually
      email: loginEmail,
      password: loginPassword,
    });

    if (result?.error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: result.error === 'CredentialsSignin' ? 'Invalid email or password.' : result.error,
      });
    } else if (result?.ok) {
      toast({ title: 'Login Successful!', description: 'Redirecting to your account...' });
      router.push('/account'); // Or wherever you want to redirect after login
    }
    setIsLoading(false);
  };

  const handleCustomerSignup = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          firstName: signupFirstName,
          lastName: signupLastName,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register.');
      }
      toast({ title: 'Registration Successful!', description: 'Please login with your new account.' });
      setActiveTab('login'); // Switch to login tab
      // Optionally, auto-login: await signIn('credentials', { email: signupEmail, password: signupPassword }); router.push('/account');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    }
    setIsLoading(false);
  };

  const handleOtpRequest = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to request OTP.');
      }
      toast({ title: 'OTP Sent (Logged)', description: 'Check server console for OTP. (Email sending not implemented)' });
      setIsOtpRequested(true);
    } catch (error) {
       toast({ variant: 'destructive', title: 'OTP Request Failed', description: error instanceof Error ? error.message : 'An unknown error occurred.' });
    }
    setIsLoading(false);
  };
  
  const handleOtpVerify = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp: otpCode }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP.');
      }
      toast({ title: 'OTP Verified!', description: 'You can now log in or complete registration.' });
      // Depending on your flow, you might auto-login or redirect to password setup
      setActiveTab('login'); // For now, redirect to login
    } catch (error) {
      toast({ variant: 'destructive', title: 'OTP Verification Failed', description: error instanceof Error ? error.message : 'An unknown error occurred.' });
    }
    setIsLoading(false);
  };


  return (
    <div className="flex flex-col justify-center items-center py-12 min-h-[calc(100vh-var(--header-height,0px)-var(--footer-height,0px))] gap-10">
      {status === 'loading' && <p>Loading session...</p>}
      {status !== 'loading' && (
        <>
          <Tabs defaultValue="login" className="w-full max-w-md" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="otp">OTP</TabsTrigger>
            </TabsList>

            {/* Customer Login Tab */}
            <TabsContent value="login">
              <Card>
                <form onSubmit={handleCustomerEmailLogin}>
                  <CardHeader>
                    <CardTitle className="text-2xl">Customer Login</CardTitle>
                    <CardDescription>Enter your email and password to login.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-login">Email</Label>
                      <Input id="email-login" type="email" placeholder="m@example.com" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label htmlFor="password-login">Password</Label>
                        <Link href="#" className="ml-auto inline-block text-sm underline text-muted-foreground hover:text-primary">
                          Forgot password?
                        </Link>
                      </div>
                      <Input id="password-login" type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                    </div>
                    <Separator className="my-4" />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                    <Button variant="outline" className="w-full mt-2" onClick={() => signIn('google', { callbackUrl: '/account' })} disabled={isLoading}>
                      <Chrome className="mr-2 h-4 w-4" /> Login with Google
                    </Button>
                     <Button variant="outline" className="w-full mt-2" onClick={() => alert('Facebook login not implemented yet.')} disabled={isLoading}>
                      <Facebook className="mr-2 h-4 w-4" /> Login with Facebook
                    </Button>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <p className="text-center text-sm text-muted-foreground">
                      Don&apos;t have an account?{' '}
                      <Button variant="link" className="p-0 h-auto text-primary" onClick={() => setActiveTab('signup')}>
                        Sign up
                      </Button>
                    </p>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            {/* Customer Sign Up Tab */}
            <TabsContent value="signup">
              <Card>
                <form onSubmit={handleCustomerSignup}>
                  <CardHeader>
                    <CardTitle className="text-2xl">Customer Sign Up</CardTitle>
                    <CardDescription>Create your customer account.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First name</Label>
                        <Input id="first-name" placeholder="Max" required value={signupFirstName} onChange={e => setSignupFirstName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input id="last-name" placeholder="Robinson" required value={signupLastName} onChange={e => setSignupLastName(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-signup">Email</Label>
                      <Input id="email-signup" type="email" placeholder="m@example.com" required value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-signup">Password</Label>
                      <Input id="password-signup" type="password" placeholder="Min. 8 characters" required value={signupPassword} onChange={e => setSignupPassword(e.target.value)} />
                    </div>
                     <Separator className="my-4" />
                     <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Creating Account...' : 'Create account'}
                    </Button>
                    <Button variant="outline" className="w-full mt-2" onClick={() => signIn('google', { callbackUrl: '/account' })} disabled={isLoading}>
                      <Chrome className="mr-2 h-4 w-4" /> Sign up with Google
                    </Button>
                    <Button variant="outline" className="w-full mt-2" onClick={() => alert('Facebook signup not implemented yet.')} disabled={isLoading}>
                      <Facebook className="mr-2 h-4 w-4" /> Sign up with Facebook
                    </Button>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <p className="text-center text-sm text-muted-foreground">
                      Already have an account?{' '}
                      <Button variant="link" className="p-0 h-auto text-primary" onClick={() => setActiveTab('login')}>
                        Login
                      </Button>
                    </p>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            {/* OTP Tab */}
            <TabsContent value="otp">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Email OTP Verification</CardTitle>
                  <CardDescription>
                    {isOtpRequested 
                        ? "Enter the OTP sent to your email (check server console)." 
                        : "Enter your email to receive an OTP for verification or registration."
                    }
                  </CardDescription>
                </CardHeader>
                {!isOtpRequested ? (
                  <form onSubmit={handleOtpRequest}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="otp-email">Email</Label>
                        <Input id="otp-email" type="email" placeholder="m@example.com" required value={otpEmail} onChange={e => setOtpEmail(e.target.value)} />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Sending...' : 'Request OTP'}
                      </Button>
                    </CardFooter>
                  </form>
                ) : (
                  <form onSubmit={handleOtpVerify}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="otp-email-display">Email (OTP Sent To)</Label>
                        <Input id="otp-email-display" type="email" value={otpEmail} readOnly disabled className="bg-muted/50"/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="otp-code">OTP Code</Label>
                        <Input id="otp-code" type="text" placeholder="Enter OTP" required value={otpCode} onChange={e => setOtpCode(e.target.value)} />
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Verifying...' : 'Verify OTP'}
                      </Button>
                       <Button variant="link" size="sm" onClick={() => setIsOtpRequested(false)} disabled={isLoading}>
                        Request for a different email?
                      </Button>
                    </CardFooter>
                  </form>
                )}
              </Card>
            </TabsContent>


          </Tabs>

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
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAdminLogin} disabled={isLoading}>
                  Login as Admin
                </Button>
              </CardFooter>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
