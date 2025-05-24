
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Role } from '@prisma/client';
import { Loader2 } from 'lucide-react';

export default function CallbackHandlerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      // Still loading session data
      return;
    }

    if (status === 'authenticated' && session?.user?.role) {
      const userRole = session.user.role;
      if ([Role.ADMIN, Role.SELLER, Role.STOCK, Role.DELIVERY].includes(userRole)) { // Added Role.DELIVERY
        router.replace('/admin');
      } else if (userRole === Role.CUSTOMER) {
        router.replace('/account');
      } else {
        // Fallback for unknown roles or if role is undefined
        console.warn('CallbackHandler: Unknown user role, redirecting to home.', session.user);
        router.replace('/');
      }
    } else if (status === 'unauthenticated') {
      // This case should ideally not be hit if coming from a successful OAuth login
      // but as a fallback, redirect to auth page.
      console.warn('CallbackHandler: Unauthenticated, redirecting to auth.');
      router.replace('/auth');
    }
    // If status is authenticated but session.user.role is not yet available,
    // the effect will re-run when session object updates.
  }, [session, status, router]);

  return (
    <div className="flex flex-col justify-center items-center py-12 min-h-[calc(100vh-var(--header-height,0px)-var(--footer-height,0px))] gap-10">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Finalizing login, please wait...</p>
      </div>
    </div>
  );
}
