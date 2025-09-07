import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import { type UserType } from "@prisma/client";
import { CustomPrismaAdapter } from "~/server/auth/adapter";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
      // ...other properties
    } & DefaultSession["user"];
  }

  interface User {
    type: UserType;
    // ...other properties
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    type: UserType;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    /**
     * ...add more providers here.
     */
  ],
  adapter: CustomPrismaAdapter(), // Usar el adapter personalizado
  callbacks: {
    session: ({ session, user }) => {
      // Aquí user viene directamente de la base de datos con todos los campos
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          type: user.type,
        },
      };
    },
    redirect: async ({ url, baseUrl }) => {
      // Redirige al usuario a /editor/courses después de autenticarse
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/editor/courses`;
      }
      return baseUrl;
    },
  },
} satisfies NextAuthConfig;