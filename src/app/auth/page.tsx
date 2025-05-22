
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useState, type FormEvent, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, Chrome, Facebook, Mail, KeyRound, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

type AuthStep = 'login' | 'signup' | 'otpVerification';

export default function AuthPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const [authStep, setAuthStep] = useState<AuthStep>('login');
  const [otpTargetEmail, setOtpTargetEmail] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  
  const [otpCode, setOtpCode] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);


  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      let description = errorParam;
      if (errorParam === 'CredentialsSignin') {
        description = 'Invalid email or password.';
      } else if (errorParam === 'Email not verified. Please check your inbox for a verification code or request a new one.') {
        // This custom error message is thrown from authorize
        description = errorParam;
        // Extract email from previous attempt if possible or prompt
        const callbackUrl = searchParams.get('callbackUrl');
        const attemptEmail = new URLSearchParams(callbackUrl?.split('?')[1] || '').get('email') || loginEmail;
        if (attemptEmail) {
          setOtpTargetEmail(attemptEmail);
          setAuthStep('otpVerification');
        }
      }
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: description,
      });
      // Clear error from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('error');
      newUrl.searchParams.delete('callbackUrl'); // Also remove callbackUrl if it's there
      router.replace(newUrl.pathname + newUrl.search, { scroll: false });
    }
  }, [searchParams, toast, router, loginEmail]);


  if (status === 'authenticated') {
    router?.push('/account');
    return <div className="text-center py-10">Loading account details...</div>;
  }
  if (status === 'loading' && !searchParams.get('error')) { // Only show main loading if not handling an error
    return <div className="text-center py-10">Loading session...</div>;
  }

  const handleAdminLogin = () => {
    router.push('/admin');
  };

  const handleCustomerEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await signIn('credentials', {
      redirect: false,
      email: loginEmail,
      password: loginPassword,
      callbackUrl: `/auth?email=${encodeURIComponent(loginEmail)}` // Pass email for error handling
    });

    if (result?.error) {
       // Error handling is now primarily done in useEffect via searchParams
       // Specific "Email not verified" error will trigger OTP step via useEffect
      if (result.error !== 'Email not verified. Please check your inbox for a verification code or request a new one.') {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: result.error === 'CredentialsSignin' ? 'Invalid email or password.' : result.error,
        });
      }
    } else if (result?.ok) {
      toast({ title: 'Login Successful!', description: 'Redirecting to your account...' });
      router.push('/account');
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
      toast({ title: 'Registration Pending Verification', description: data.message });
      setOtpTargetEmail(data.emailForOtp);
      setAuthStep('otpVerification');
      // Clear signup form fields
      setSignupFirstName(''); setSignupLastName(''); setSignupEmail(''); setSignupPassword('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    }
    setIsLoading(false);
  };
  
  const handleOtpVerify = async (e: FormEvent) => {
    e.preventDefault();
    setIsOtpSubmitting(true);
    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpTargetEmail, otp: otpCode }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP.');
      }
      toast({ title: 'Email Verified!', description: 'Your email has been verified. Please log in.' });
      setAuthStep('login');
      setLoginEmail(otpTargetEmail); // Pre-fill login email
      setOtpCode('');
      setOtpTargetEmail('');
    } catch (error) {
      toast({ variant: 'destructive', title: 'OTP Verification Failed', description: error instanceof Error ? error.message : 'An unknown error occurred.' });
    }
    setIsOtpSubmitting(false);
  };

  const handleResendOtp = async () => {
    if (!otpTargetEmail) {
        toast({ variant: 'destructive', title: 'Error', description: 'Email not specified for OTP.' });
        return;
    }
    setIsResendingOtp(true);
    try {
      const response = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpTargetEmail }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP.');
      }
      toast({ title: 'OTP Resent (Logged)', description: 'A new OTP has been generated. Check server console.' });
    } catch (error) {
       toast({ variant: 'destructive', title: 'OTP Resend Failed', description: error instanceof Error ? error.message : 'An unknown error occurred.' });
    }
    setIsResendingOtp(false);
  };

  const renderLogin = () => (
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
            {isLoading ? <Loader2 className="animate-spin" /> : 'Login'}
          </Button>
          <Button type="button" variant="outline" className="w-full mt-2" onClick={() => signIn('google', { callbackUrl: '/account' })} disabled={isLoading}>
            <Chrome className="mr-2 h-4 w-4" /> Login with Google
          </Button>
            <Button type="button" variant="outline" className="w-full mt-2" onClick={() => alert('Facebook login not implemented yet.')} disabled={isLoading}>
            <Facebook className="mr-2 h-4 w-4" /> Login with Facebook
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Button variant="link" className="p-0 h-auto text-primary" onClick={() => setAuthStep('signup')}>
              Sign up
            </Button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );

  const renderSignup = () => (
    <Card>
      <form onSubmit={handleCustomerSignup}>
        <CardHeader>
          <CardTitle className="text-2xl">Customer Sign Up</CardTitle>
          <CardDescription>Create your customer account. You will need to verify your email.</CardDescription>
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
            {isLoading ? <Loader2 className="animate-spin" /> : 'Create account & Verify Email'}
          </Button>
          <Button type="button" variant="outline" className="w-full mt-2" onClick={() => signIn('google', { callbackUrl: '/account' })} disabled={isLoading}>
            <Chrome className="mr-2 h-4 w-4" /> Sign up with Google
          </Button>
          <Button type="button" variant="outline" className="w-full mt-2" onClick={() => alert('Facebook signup not implemented yet.')} disabled={isLoading}>
            <Facebook className="mr-2 h-4 w-4" /> Sign up with Facebook
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button variant="link" className="p-0 h-auto text-primary" onClick={() => setAuthStep('login')}>
              Login
            </Button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );

  const renderOtpVerification = () => (
    <Card>
      <form onSubmit={handleOtpVerify}>
        <CardHeader>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            An OTP has been logged to the server console for <span className="font-semibold">{otpTargetEmail}</span>. 
            Enter it below to verify your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp-code">OTP Code</Label>
            <Input id="otp-code" type="text" placeholder="Enter 6-digit OTP" required value={otpCode} onChange={e => setOtpCode(e.target.value)} maxLength={6} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isOtpSubmitting || isLoading}>
            {isOtpSubmitting ? <Loader2 className="animate-spin" /> : 'Verify OTP'}
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={handleResendOtp} disabled={isResendingOtp || isLoading}>
            {isResendingOtp ? <Loader2 className="animate-spin" /> : 'Resend OTP'}
          </Button>
          <Button variant="link" size="sm" onClick={() => { setAuthStep('login'); setOtpTargetEmail(''); setOtpCode('');}} disabled={isLoading}>
            Back to Login
          </Button>
        </CardFooter>
      </form>
    </Card>
  );


  return (
    <div className="flex flex-col justify-center items-center py-12 min-h-[calc(100vh-var(--header-height,0px)-var(--footer-height,0px))] gap-10">
        <div className="w-full max-w-md">
            <div className="mb-6 text-center">
                <Button variant={authStep === 'login' ? 'default' : 'outline'} onClick={() => setAuthStep('login')} className="mr-2">Login</Button>
                <Button variant={authStep === 'signup' ? 'default' : 'outline'} onClick={() => setAuthStep('signup')}>Sign Up</Button>
            </div>

            {authStep === 'login' && renderLogin()}
            {authStep === 'signup' && renderSignup()}
            {authStep === 'otpVerification' && renderOtpVerification()}
        </div>

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
    </div>
  );
}
