
import type { DefaultSession, User as NextAuthUser, Role as NextAuthRole } from 'next-auth'; // Import Role from next-auth if it exists
import type { JWT as NextAuthJWT } from 'next-auth/jwt';

// Define your custom Role enum
enum Role {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
  STOCK = 'STOCK',
}

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      role?: Role; // Add role to session user
    } & DefaultSession['user']; // Extends default user properties (name, email, image)
  }

  interface User extends NextAuthUser {
    role?: Role; // Add role to NextAuth User type
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends NextAuthJWT {
    role?: Role; // Add role to JWT
    // id?: string; // id is typically in token.sub
  }
}
