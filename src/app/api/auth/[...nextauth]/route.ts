
import NextAuth, { type NextAuthOptions, type User as NextAuthUser } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { Role } from '@prisma/client'; // Import Role enum from Prisma

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
          throw new Error('Email not verified. Please check your inbox for a verification code or request a new one.');
        }
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role, // Include role
        } as NextAuthUser & { role: Role }; // Type assertion to include role
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        if (token.role) {
          session.user.role = token.role as Role; // Add role to session
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        if (user.role) {
          token.role = user.role as Role; // Add role to JWT from User object
        }
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
