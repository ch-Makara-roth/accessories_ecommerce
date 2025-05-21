
import NextAuth, { type NextAuthOptions, type User as NextAuthUser } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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
      // Prisma adapter automatically handles account linking for OAuth providers.
      // It also sets emailVerified if the provider confirms it.
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing email or password');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Invalid email or password.');
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          throw new Error('Invalid email or password.');
        }

        if (!user.emailVerified) {
          // Custom error code or message that the client can specifically check for
          throw new Error('Email not verified. Please check your inbox for a verification code or request a new one.');
        }
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          // emailVerified: user.emailVerified // Can be passed if needed by client session
        } as NextAuthUser; 
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth', 
    error: '/auth', // Redirect to /auth on error, error type will be in query params
  },
  session: {
    strategy: 'jwt', 
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        // Add emailVerified to session if needed by client
        // if (token.emailVerified) {
        //   (session.user as any).emailVerified = token.emailVerified;
        // }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) { 
        token.sub = user.id;
        // if (user.emailVerified) { // user object from authorize or OAuth
        //   token.emailVerified = user.emailVerified;
        // }
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
