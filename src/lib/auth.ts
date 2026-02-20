import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const TOKEN_CACHE = new Map<string, { data: Record<string, unknown>; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCachedTokenData(userId: string) {
  const cached = TOKEN_CACHE.get(userId);
  if (cached && cached.expiresAt > Date.now()) return cached.data;
  TOKEN_CACHE.delete(userId);
  return null;
}

function setCachedTokenData(userId: string, data: Record<string, unknown>) {
  TOKEN_CACHE.set(userId, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        // Invalidate cache on fresh login
        TOKEN_CACHE.delete(user.id);
      }

      if (token.id) {
        const userId = token.id as string;

        // Invalidate cache when client triggers an update
        if (trigger === "update") {
          TOKEN_CACHE.delete(userId);
          if (session?.organizationId) {
            token.organizationId = session.organizationId;
          }
        }

        const cached = getCachedTokenData(userId);
        if (cached) {
          Object.assign(token, cached);
        } else {
          const [dbUser, membership] = await Promise.all([
            prisma.user.findUnique({
              where: { id: userId },
              select: { role: true },
            }),
            prisma.organizationMember.findFirst({
              where: { userId },
              include: { organization: true },
              orderBy: { createdAt: "asc" },
            }),
          ]);

          const data: Record<string, unknown> = {};

          if (dbUser) {
            token.systemRole = dbUser.role;
            data.systemRole = dbUser.role;
          }

          if (membership) {
            token.organizationId = membership.organization.id;
            token.organizationName = membership.organization.name;
            token.role = membership.role;
            data.organizationId = membership.organization.id;
            data.organizationName = membership.organization.name;
            data.role = membership.role;
          }

          setCachedTokenData(userId, data);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.organizationId = token.organizationId as string;
        session.user.organizationName = token.organizationName as string;
        session.user.role = token.role as string;
        session.user.systemRole = token.systemRole as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      const org = await prisma.organization.create({
        data: {
          name: `${user.name || user.email?.split("@")[0]}'s Organization`,
          slug: `org-${user.id.slice(0, 8)}`,
          members: {
            create: {
              userId: user.id,
              role: "OWNER",
            },
          },
        },
      });

      await prisma.subscription.create({
        data: {
          stripeCustomerId: `pending_${user.id}`,
          plan: "FREE",
          status: "ACTIVE",
          organizationId: org.id,
          userId: user.id,
          maxWebsites: 1,
          maxPostsPerMonth: 5,
          maxImagesPerMonth: 5,
        },
      });
    },
  },
};
