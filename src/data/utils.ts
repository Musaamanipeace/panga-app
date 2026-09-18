// src/data/utils.ts
export function newId(): string {
  return crypto.randomUUID();
}

export function now(): number {
  return Date.now();
}
