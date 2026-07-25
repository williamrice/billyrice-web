import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { APIError } from 'better-auth/api';
import { isAllowedAuthEmail } from './auth-allowlist';
import { env } from './env';
import prisma from './prisma';

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (data) => {
          if (!isAllowedAuthEmail(data.email as string | undefined)) {
            throw new APIError('FORBIDDEN', {
              message: 'Email not allowed',
            });
          }

          return {
            data: {
              ...data,
              isAdmin: true,
            },
          };
        },
      },
    },
    session: {
      create: {
        before: async (data, ctx) => {
          const user = await ctx?.context.internalAdapter.findUserById(
            data.userId as string,
          );

          if (!isAllowedAuthEmail(user?.email)) {
            throw new APIError('FORBIDDEN', {
              message: 'Email not allowed',
            });
          }
        },
      },
    },
  },
  user: {
    additionalFields: {
      isAdmin: { type: 'boolean', default: false },
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_SECRET,
    },
  },
});
