import crypto from 'crypto';

export function generateDeviceSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashDeviceSecret(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

export function verifyDeviceSecret(providedSecret: string, storedHash: string): boolean {
  const computedHash = hashDeviceSecret(providedSecret);
  try {
    const a = Buffer.from(computedHash, 'hex');
    const b = Buffer.from(storedHash, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
