/**
 * Client-Side Cryptographic Service using WebCrypto API
 * AES-256-GCM + PBKDF2 (SHA-256, 100,000 rounds)
 * Zero-knowledge: Plaintext never leaves device unencrypted.
 */

// Convert ArrayBuffer to Base64
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to Uint8Array
export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Derive AES-GCM CryptoKey using PBKDF2 from user's master passphrase
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Generate verifier hash for validating passphrase during vault unlock
export async function createPassphraseVerifier(passphrase: string, saltBase64: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = base64ToBuffer(saltBase64);
  const combined = new Uint8Array([...enc.encode(passphrase), ...salt]);
  const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
  return bufferToBase64(hashBuffer);
}

// Verify passphrase against stored verifier
export async function verifyPassphrase(passphrase: string, saltBase64: string, expectedVerifier: string): Promise<boolean> {
  const computed = await createPassphraseVerifier(passphrase, saltBase64);
  return computed === expectedVerifier;
}

// Encrypt any object or string using Master Passphrase
export async function encryptData(
  data: any,
  passphrase: string,
  existingSaltBase64?: string
): Promise<{ ciphertext: string; salt: string; iv: string }> {
  const salt = existingSaltBase64 ? base64ToBuffer(existingSaltBase64) : crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
  const encodedData = new TextEncoder().encode(jsonString);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    encodedData
  );

  return {
    ciphertext: bufferToBase64(encryptedBuffer),
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
  };
}

// Decrypt ciphertext using Master Passphrase
export async function decryptData(
  ciphertextBase64: string,
  saltBase64: string,
  ivBase64: string,
  passphrase: string
): Promise<any> {
  const salt = base64ToBuffer(saltBase64);
  const iv = base64ToBuffer(ivBase64);
  const ciphertext = base64ToBuffer(ciphertextBase64);

  const key = await deriveKey(passphrase, salt);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    ciphertext as BufferSource
  );

  const decodedString = new TextDecoder().decode(decryptedBuffer);
  try {
    return JSON.parse(decodedString);
  } catch {
    return decodedString;
  }
}

// Generate random cryptographic recovery key / mnemonic words
export function generateRecoveryKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const parts: string[] = [];
  for (let i = 0; i < 4; i++) {
    let segment = '';
    const randomVals = crypto.getRandomValues(new Uint8Array(4));
    for (let j = 0; j < 4; j++) {
      segment += chars[randomVals[j] % chars.length];
    }
    parts.push(segment);
  }
  return parts.join('-');
}
