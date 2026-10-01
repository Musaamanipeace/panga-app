// src/sync/crypto.ts
// Lightweight credential encryption using the Web Crypto API (AES-GCM).
// Protects WebDAV app passwords from being stored in plaintext in IndexedDB.
// The key is derived from a fixed application secret via PBKDF2 so it works
// without any user-supplied passphrase. While not a replacement for a
// hardware-backed keychain, it ensures credentials are never stored in
// raw plaintext in localStorage or IndexedDB.

const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();

// A fixed application secret — combined with a salt to derive the AES key.
const APP_SECRET = "panga-webdav-v1";
const APP_SALT = "panga-salt-v1";
const ITERATIONS = 100_000;

let cachedKey: CryptoKey | null = null;

async function getEncryptionKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    ENCODER.encode(APP_SECRET),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  cachedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: ENCODER.encode(APP_SALT),
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  return cachedKey;
}

/** Encrypt plaintext and return base64(iv + ciphertext). */
export async function encryptText(plaintext: string): Promise<string> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    ENCODER.encode(plaintext)
  );
  const combined = new Uint8Array(iv.length + (encrypted as ArrayBuffer).byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  return bufferToBase64(combined);
}

/** Decrypt a base64(iv + ciphertext) string back to plaintext. */
export async function decryptText(encrypted: string): Promise<string> {
  const key = await getEncryptionKey();
  const combined = base64ToBuffer(encrypted);
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  return DECODER.decode(decrypted);
}

function bufferToBase64(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf));
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buf[i] = binary.charCodeAt(i);
  }
  return buf;
}
