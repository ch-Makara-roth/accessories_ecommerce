
import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('Missing GOOGLE_CLIENT_ID environment variable');
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing GOOGLE_CLIENT_SECRET environment variable');
}
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Missing NEXTAUTH_SECRET environment variable');
}
if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL environment variable for Prisma');
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Add other providers here if needed (e.g., Facebook)
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth', // Redirect users to your custom login page
    // error: '/auth/error', // (Optional) A page to handle authentication errors
  },
  session: {
    strategy: 'jwt', // Using JWT for session strategy
  },
  callbacks: {
    async session({ session, token }) {
      // Add user id and other custom fields to the session
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      // You can add other token properties to session here if needed
      // e.g., session.user.role = token.role; 
      return session;
    },
    async jwt({ token, user, account, profile }) {
      // Persist the OAuth access_token and user id to the token right after signin
      if (account && user) {
        token.accessToken = account.access_token;
        token.sub = user.id; // user.id is available from Prisma adapter
        // token.role = user.role; // If you add role to your User model
      }
      return token;
    },
  },
  // Debugging can be enabled for development
  // debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
