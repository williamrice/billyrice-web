import 'server-only';

import { env } from './env';

const allowedAuthEmails = env.ALLOWED_AUTH_EMAILS
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAllowedAuthEmail(email: string | null | undefined) {
  return Boolean(email && allowedAuthEmails.includes(email.toLowerCase()));
}
