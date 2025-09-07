// server/auth/adapter.ts
import { type Adapter } from "next-auth/adapters"
import { UserType } from "@prisma/client"
import { db } from "~/server/db"

export function CustomPrismaAdapter(): Adapter {
  return {
    createUser: async (user) => {
      const createdUser = await db.user.create({
        data: {
          ...user,
          type: UserType.NORMAL,
        },
      })
      
      return {
        id: createdUser.id,
        email: createdUser.email!,
        emailVerified: createdUser.emailVerified,
        name: createdUser.name,
        image: createdUser.image,
        type: createdUser.type,
      }
    },

    getUser: async (id) => {
      const user = await db.user.findUnique({
        where: { id }
      })
      
      if (!user) return null
      
      return {
        id: user.id,
        email: user.email!,
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
        type: user.type,
      }
    },

    getUserByEmail: async (email) => {
      const user = await db.user.findUnique({
        where: { email }
      })
      
      if (!user) return null
      
      return {
        id: user.id,
        email: user.email!,
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
        type: user.type,
      }
    },

    getUserByAccount: async ({ providerAccountId, provider }) => {
      const account = await db.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        include: {
          user: true,
        },
      })
      
      if (!account) return null
      
      return {
        id: account.user.id,
        email: account.user.email!,
        emailVerified: account.user.emailVerified,
        name: account.user.name,
        image: account.user.image,
        type: account.user.type,
      }
    },

    updateUser: async ({ id, ...updateData }) => {
      const updatedUser = await db.user.update({
        where: { id },
        data: updateData,
      })
      
      return {
        id: updatedUser.id,
        email: updatedUser.email!,
        emailVerified: updatedUser.emailVerified,
        name: updatedUser.name,
        image: updatedUser.image,
        type: updatedUser.type,
      }
    },

    deleteUser: async (userId) => {
      await db.user.delete({
        where: { id: userId }
      })
    },

    linkAccount: async (account) => {
      await db.account.create({
        data: account
      })
    },

    unlinkAccount: async ({ providerAccountId, provider }) => {
      await db.account.delete({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
      })
    },

    createSession: async ({ sessionToken, userId, expires }) => {
      return await db.session.create({
        data: {
          sessionToken,
          userId,
          expires,
        },
      })
    },

    getSessionAndUser: async (sessionToken) => {
      const userAndSession = await db.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      })

      if (!userAndSession) return null

      const { user, ...session } = userAndSession

      return {
        session,
        user: {
          id: user.id,
          email: user.email!,
          emailVerified: user.emailVerified,
          name: user.name,
          image: user.image,
          type: user.type,
        },
      }
    },

    updateSession: async ({ sessionToken, ...updateData }) => {
      return await db.session.update({
        where: { sessionToken },
        data: updateData,
      })
    },

    deleteSession: async (sessionToken) => {
      await db.session.delete({
        where: { sessionToken },
      })
    },

    createVerificationToken: async ({ identifier, expires, token }) => {
      return await db.verificationToken.create({
        data: {
          identifier,
          expires,
          token,
        },
      })
    },

    useVerificationToken: async ({ identifier, token }) => {
      try {
        const verificationToken = await db.verificationToken.delete({
          where: {
            identifier_token: {
              identifier,
              token,
            },
          },
        })
        return verificationToken
      } catch (error) {
        // If token doesn't exist, return null
        return null
      }
    },
  }
}