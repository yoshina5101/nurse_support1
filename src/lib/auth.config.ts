import type { NextAuthConfig, DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "STUDENT" | "ADMIN";
      plan: "FREE" | "PREMIUM";
    } & DefaultSession["user"];
  }
  interface User {
    role: "STUDENT" | "ADMIN";
    plan: "FREE" | "PREMIUM";
  }
}

// Edge ランタイム(middleware)でも安全に読み込める設定。
// Prisma / bcrypt を含む Credentials プロバイダは auth.ts 側で追加する。
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.plan = user.plan;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "STUDENT" | "ADMIN";
        session.user.plan = token.plan as "FREE" | "PREMIUM";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
