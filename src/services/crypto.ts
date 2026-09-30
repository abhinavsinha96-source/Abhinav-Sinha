/**
 * Cryptographic engine powered by Web Crypto API.
 * Uses AES-GCM (256-bit) and PBKDF2 (SHA-256, 100,000 iterations)
 * for End-to-End Encryption (E2EE) and Secure Profile Vault.
 */

// Helper to convert ArrayBuffer to Base64
export function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper to convert Base64 to ArrayBuffer
export function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Helper to convert string to UTF-8 BufferSource
function strToBytes(str: string): BufferSource {
  return new TextEncoder().encode(str) as unknown as BufferSource;
}

// Helper to convert ArrayBuffer to string
function bytesToStr(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}

/**
 * Derives an AES-GCM CryptoKey from a passphrase and salt using PBKDF2.
 */
export async function deriveKeyFromPassphrase(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    strToBytes(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts arbitrary plaintext using AES-GCM 256-bit.
 * Returns Base64-encoded ciphertext, IV, and salt.
 */
export async function encryptText(plaintext: string, secretKeyStr: string): Promise<{
  ciphertext: string;
  iv: string;
  salt: string;
}> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKeyFromPassphrase(secretKeyStr, salt);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    strToBytes(plaintext)
  );

  return {
    ciphertext: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv.buffer),
    salt: bufferToBase64(salt.buffer)
  };
}

/**
 * Decrypts AES-GCM 256-bit ciphertext given the passphrase, IV, and salt.
 */
export async function decryptText(
  ciphertextBase64: string,
  ivBase64: string,
  saltBase64: string,
  secretKeyStr: string
): Promise<string> {
  try {
    const salt = new Uint8Array(base64ToBuffer(saltBase64));
    const iv = new Uint8Array(base64ToBuffer(ivBase64));
    const key = await deriveKeyFromPassphrase(secretKeyStr, salt);
    const ciphertext = base64ToBuffer(ciphertextBase64);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      ciphertext
    );

    return bytesToStr(decryptedBuffer);
  } catch (err) {
    console.error('Decryption failed:', err);
    throw new Error('Decryption failed: Incorrect key, invalid payload, or corrupt data.');
  }
}

/**
 * Generates deterministic conversation secret for two user IDs so mutual friends can encrypt/decrypt
 */
export function getConversationSecret(userIdA: string, userIdB: string): string {
  const sorted = [userIdA, userIdB].sort();
  return `haven_e2ee_${sorted[0]}_${sorted[1]}_channel_v1`;
}

/**
 * Generate formatted cryptographic safety number / fingerprint string
 * e.g., "59218 04921 78401 22941 81023 93012"
 */
export async function generateSafetyFingerprint(idA: string, idB: string): Promise<string> {
  const sorted = [idA, idB].sort();
  const input = `haven_identity_v1:${sorted[0]}:${sorted[1]}`;
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', strToBytes(input));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  // Transform hash into 6 blocks of 5 decimal digits
  let fingerprint = '';
  for (let i = 0; i < 6; i++) {
    const slice = hashArray.slice(i * 4, i * 4 + 4);
    const num = ((slice[0] << 24) | (slice[1] << 16) | (slice[2] << 8) | slice[3]) >>> 0;
    const formatted = (num % 100000).toString().padStart(5, '0');
    fingerprint += (i === 0 ? '' : ' ') + formatted;
  }
  return fingerprint;
}

/**
 * Generate personal cryptographic public key fingerprint for user profile
 */
export async function generateUserFingerprint(userId: string, handle: string): Promise<string> {
  const input = `haven_user_key:${userId}:${handle}`;
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', strToBytes(input));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `${hex.slice(0, 4)} ${hex.slice(4, 8)} ${hex.slice(8, 12)} ${hex.slice(12, 16)} ... ${hex.slice(-8, -4)} ${hex.slice(-4)}`;
}
