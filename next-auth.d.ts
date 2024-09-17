import { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */

  interface Session {
    user: {
      userId: string;
      companyId: string | null;
    } & DefaultSession['user'];
  }
  interface User {
    userId: string;
    companyId: string | null;
  }

}
declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    userId: string;
    companyId: string | null;
  }
}