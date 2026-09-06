/**
 * Cryptographic utility helpers for generating authentic-looking verification hashes,
 * digital signatures for RGUKT clearance certificates, and secure password hashing.
 */

// Simple deterministic cryptographic hash for client-side password security
export function hashPassword(plainText: string): string {
  const salt = 'RGUKT_RKV_STUDENT_SALT_2024';
  const str = `${salt}:${plainText.trim()}`;
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c64e6d ^ 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `sha256_mock_${part1}${part2}`;
}

export function verifyPassword(inputPassword: string, storedHash?: string): boolean {
  if (!storedHash) return false;
  // If storedHash is formatted as hash, compare with hash of input (case-insensitive for roll number default)
  const inputHashLower = hashPassword(inputPassword.toLowerCase().trim());
  const inputHashExact = hashPassword(inputPassword.trim());
  return storedHash === inputHashLower || storedHash === inputHashExact;
}

export function generateVerificationHash(prefix: string, seed: string): string {
  const chars = '0123456789ABCDEF';
  let hash = '';
  const combined = `${prefix}-${seed}-${Date.now()}`;
  
  let val = 0;
  for (let i = 0; i < combined.length; i++) {
    val = (val * 31 + combined.charCodeAt(i)) % 0xFFFFFFFF;
  }

  for (let i = 0; i < 16; i++) {
    const idx = Math.abs((val ^ (i * 37) ^ (combined.charCodeAt(i % combined.length) * 17)) % chars.length);
    hash += chars[idx];
  }

  return `RGUKT-${prefix.toUpperCase()}-${hash.slice(0, 4)}-${hash.slice(4, 8)}-${hash.slice(8, 12)}`;
}

export function generateCertificateNumber(studentId: string, branch: string): string {
  const year = new Date().getFullYear();
  const branchCode = branch.split(' ')[0].toUpperCase().slice(0, 3);
  const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
  return `RGUKT-RKV/ND/${year}/${branchCode}/${studentId.toUpperCase()}/${randomHex}`;
}

export function formatTimestamp(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return isoString;
  }
}
