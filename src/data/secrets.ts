// src/data/secrets.ts
// Encrypted secrets vault using PBKDF2-derived key + AES-GCM via WebCrypto.
// The passphrase is never stored — only a verification hash.
// Secrets are stored as Resource rows with category: "secrets".

import { db, type Resource, type ResourceCategory } from "./db";
import { getSetting, setSetting } from "./settings";
import { newId, now } from "./utils";

const SECRET_CATEGORY: ResourceCategory = "secrets";
const ITERATIONS = 200_000;
const KEY_LENGTH = 256;
const SALT = "panga-secrets-salt-v1"; // static salt for passphrase verification hash
const SESSION_KEY_CACHE = "panga_secret_key_handle";

export interface SecretEntry {
  id: string;
  title: string;
  tags: string[];
  value: string; // decrypted plaintext, only held in memory during active session
  createdAt: number;
  updatedAt: number;
}

interface VaultMeta {
  verified: boolean;
  salt: string; // random salt for PBKDF2 key derivation (hex)
  verifyHash: string; // hash to validate passphrase (hex)
}

export async function isVaultInitialized(): Promise<boolean> {
  const meta = await getSetting<VaultMeta>("secretsVault");
  return !!meta;
}

export async function getVaultMeta(): Promise<VaultMeta | null> {
  return (await getSetting<VaultMeta>("secretsVault")) ?? null;
}

async function deriveKey(passphrase: string, saltHex: string): Promise<CryptoKey> {
  const salt = hexToBytes(saltHex);
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

async function computeVerifyHash(passphrase: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: hexToBytes(SALT), iterations: ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return bytesToHex(new Uint8Array(bits));
}

export async function initializeVault(passphrase: string): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = bytesToHex(salt);
  const verifyHash = await computeVerifyHash(passphrase);
  const meta: VaultMeta = { verified: false, salt: saltHex, verifyHash };
  await setSetting("secretsVault", meta);
}

export async function verifyPassphrase(passphrase: string): Promise<boolean> {
  const meta = await getVaultMeta();
  if (!meta) return false;
  const hash = await computeVerifyHash(passphrase, meta.salt);
  return hash === meta.verifyHash;
}

export async function unlockVault(passphrase: string): Promise<CryptoKey | null> {
  const ok = await verifyPassphrase(passphrase);
  if (!ok) return null;
  const meta = await getVaultMeta();
  if (!meta) return null;
  return deriveKey(passphrase, meta.salt);
}

export async function cacheSessionKey(_key: CryptoKey): Promise<void> {
  await setSetting(SESSION_KEY_CACHE, { cached: true });
}

export async function clearSessionKey(): Promise<void> {
  await db.settings.where("key").equals(SESSION_KEY_CACHE).delete();
}

// In-memory only — never persisted
let sessionKey: CryptoKey | null = null;

export function getSessionKey(): CryptoKey | null {
  return sessionKey;
}

export function setSessionKey(key: CryptoKey | null): void {
  sessionKey = key;
}

export function isVaultUnlocked(): boolean {
  return sessionKey !== null;
}

export function lockVault(): void {
  sessionKey = null;
}

export async function createSecret(input: {
  projectId?: string | null;
  title: string;
  tags?: string[];
  value: string;
}): Promise<Resource> {
  if (!sessionKey) throw new Error("Vault is locked");
  const [encrypted] = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: new Uint8Array(12) },
    sessionKey,
    new TextEncoder().encode(input.value)
  );
  const dataUrl = "data:application/octet-stream;base64," + bytesToBase64(new Uint8Array(encrypted));
  const t = now();
  const resource: Resource = {
    id: newId(),
    projectId: input.projectId ?? null,
    category: SECRET_CATEGORY,
    title: input.title,
    tags: input.tags ?? [],
    url: null,
    provider: null,
    contactType: null,
    value: dataUrl,
    body: null,
    images: [],
    files: [],
    createdAt: t,
    updatedAt: t,
    syncStatus: "pending",
  };
  await db.resources.add(resource);
  return resource;
}

export async function decryptSecret(resource: Resource): Promise<string | null> {
  if (!sessionKey) return null;
  try {
    const dataUrl = resource.value ?? "";
    const base64 = dataUrl.split(",")[1];
    if (!base64) return null;
    const encrypted = base64ToBytes(base64);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(12) },
      sessionKey,
      encrypted
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

export async function listSecrets(projectId?: string | null): Promise<Resource[]> {
  const all = await db.resources.where("category").equals(SECRET_CATEGORY).toArray();
  const filtered = projectId ? all.filter((r) => r.projectId === projectId) : all;
  return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
