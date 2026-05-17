import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

// NextAuth reads NEXTAUTH_SECRET directly from process.env — set it if missing
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'wardrobe-super-secret-key-2024';
}

// On Railway, always use the public domain (overrides any stale localhost value)
if (process.env.RAILWAY_PUBLIC_DOMAIN) {
  process.env.NEXTAUTH_URL = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? 'wardrobe-super-secret-key-2024',
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Passwort', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return { id: user.id, name: user.username, email: user.email };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
};
