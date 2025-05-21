
import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('Missing GOOGLE_CLIENT_ID environment variable');
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing GOOGLE_CLIENT_SECRET environment variable');
}
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Missing NEXTAUTH_SECRET environment variable');
}

export const authOptions: NextAuthOptions = {
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
  // Callbacks can be used to control what happens on sign-in, session creation, etc.
  // callbacks: {
  //   async jwt({ token, account }) {
  //     // Persist the OAuth access_token to the token right after signin
  //     if (account) {
  //       token.accessToken = account.access_token
  //     }
  //     return token
  //   },
  //   async session({ session, token, user }) {
  //     // Send properties to the client, like an access_token from a provider.
  //     // session.accessToken = token.accessToken // Example
  //     return session
  //   }
  // }
  // For database persistence of users, you would configure an adapter here
  // adapter: MongoDBAdapter(clientPromise) // Example using MongoDB
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
