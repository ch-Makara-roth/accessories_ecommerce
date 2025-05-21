
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
if (!process.env.DATABASE_URL) { // Prisma uses DATABASE_URL
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
          // User not found or user signed up with OAuth and doesn't have a password
          throw new Error('Invalid email or password');
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          throw new Error('Invalid email or password');
        }
        
        // Return user object that NextAuth expects
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        } as NextAuthUser; // Cast to NextAuthUser
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth', 
    // error: '/auth/error', // (Optional) A page to handle authentication errors
  },
  session: {
    strategy: 'jwt', 
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        // You can add other token properties to session here if needed
        // e.g., session.user.role = token.role; 
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user) { // This user object comes from the provider (Google or Credentials)
        token.sub = user.id;
        // If you add role to your User model and want it in JWT
        // const dbUser = await prisma.user.findUnique({ where: { id: user.id }});
        // if (dbUser?.role) token.role = dbUser.role;
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
