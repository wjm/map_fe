import type { NextAuthConfig } from 'next-auth';
import { User } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ request, auth }) {
      const isLoggedIn = !!auth?.user;
      typeof (request);
      if (isLoggedIn) return true;
      return false;
    },
    redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      return "/"
      if (url.startsWith("/")) return `${baseUrl}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return baseUrl
      return baseUrl
    },
    async session({ session, token}) {

      const tokenUser = token.user as AdapterUser & { userId: string; companyId: string | null;} & User;
      //session.user.mapId = tokenUser.mapId;
      session.user = tokenUser;

      return session
    },
    async jwt({ token, user, account,trigger, session }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      const tokenUser = token.user as AdapterUser & { userId: string; companyId: string | null;} & User;

      if (trigger === "update" && session?.companyId) {
        tokenUser.companyId = session.companyId
      }
      //return token
      if (account) {
        token.userId = user.userId
        token.companyId = user.companyId
        token.user = user
      }
      return token
    }
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;