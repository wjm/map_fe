import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from '../../auth.config';
import { z } from 'zod';
import type { User } from 'next-auth';

type Labler = {
  username: string;
  password: string
};
async function getResponse(user: Labler): Promise<User & { userId: string } | undefined> {
  try {
    const response = await fetch(process.env.API_URL + '/api/user/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user)
    });
    if (!response.ok) {
      return undefined;
    }

    const res = await response.json();
    const labeler: User = {
      id: res.userId,
      email: user.username,
      userId: res.userId,
      companyId: res.company,
    };
    return labeler;
  } catch (error) {
    console.error('Failed to get response:', error);
    throw new Error('Failed to get response.');
  }
}

export const { handlers: { GET, POST }, auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ username: z.string(), password: z.string() })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { username, password } = parsedCredentials.data;
          const labelerInfo = { username, password };
          const user = await getResponse(labelerInfo);
          if (!user) return null;
          return user;
        }

        return null;
      },
    }),
  ],

});