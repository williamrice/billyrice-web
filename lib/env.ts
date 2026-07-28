import 'server-only';

import { z } from 'zod';

const optionalString = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().trim().min(1).optional(),
);

const serverEnvironmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  POSTGRES_URL: z.string().trim().min(1, 'POSTGRES_URL is required'),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_TRUSTED_ORIGINS: optionalString,
  GOOGLE_CLIENT_ID: z.string().trim().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_SECRET: z.string().trim().min(1, 'GOOGLE_SECRET is required'),
  ALLOWED_AUTH_EMAILS: z
    .string()
    .trim()
    .min(1, 'ALLOWED_AUTH_EMAILS is required'),
  REDIS_URL: optionalString,
  RESEND_API_KEY: optionalString,
  FROM_EMAIL: optionalString,
  TO_EMAIL: optionalString,
  GCLOUD_API_KEY: optionalString,
  AWS_REGION: optionalString,
  AWS_BUCKET: optionalString,
  AWS_ACCESS_KEY_ID: optionalString,
  AWS_SECRET_ACCESS_KEY: optionalString,
});

const parsedEnvironment = serverEnvironmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const invalidKeys = parsedEnvironment.error.issues
    .map((issue) => issue.path.join('.'))
    .filter(Boolean)
    .join(', ');

  throw new Error(
    `Invalid server environment configuration. Check: ${invalidKeys}`,
  );
}

export const env = parsedEnvironment.data;
