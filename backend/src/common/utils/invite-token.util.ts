import { createHash, randomBytes } from 'crypto';

const INVITE_TOKEN_BYTES = 32;

export function generateInviteToken(): string {
  return randomBytes(INVITE_TOKEN_BYTES).toString('hex');
}

export function hashInviteToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function getInviteExpiryDate(days = 7): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
}
