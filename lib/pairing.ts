import crypto from 'crypto';

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generatePairCode(length: number = 6): string {
  const bytes = crypto.randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CHARSET[bytes[i] % CHARSET.length];
  }
  return code;
}

export function sanitizePairCode(input: string): string {
  return (input || '')
    .toUpperCase()
    .trim()
    .replace(/[^ABCDEFGHJKLMNPQRSTUVWXYZ23456789]/g, '');
}

export function isValidPairCodeFormat(code: string): boolean {
  if (!code || code.length !== 6) return false;
  const regex = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;
  return regex.test(code);
}
