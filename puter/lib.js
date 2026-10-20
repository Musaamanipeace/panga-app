/**
 * lib.js — Small, dependency-free utilities for the Puter-powered Panga frontend.
 * Everything here is plain JavaScript with JSDoc types; no framework required.
 */

/**
 * Generate a unique, collision-resistant id.
 * Prefers the Web Crypto API and falls back to a Math.random UUID.
 * @returns {string}
 */
export function newId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // UUID v4 fallback
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = (Math.random() * 256) | 0;
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

/** @returns {number} epoch milliseconds */
export const now = () => Date.now();

/**
 * Escape a string for safe insertion as HTML text.
 */
export function escapeHTML(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Escape an attribute value.
 */
export function escAttr(str) {
  return escapeHTML(str).replace(/"/g, "&quot;");
}

/**
 * Format a timestamp as a relative + absolute date string.
 * @param {number} ts
 * @returns {string}
 */
export function formatDatetime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const date = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${date}, ${time}`;
}

/**
 * Format a timestamp as "Today/Tomorrow + time" or a date.
 * @param {number} ts
 */
export function formatRelativeDay(ts) {
  if (!ts) return "";
  const DAY = 24 * 60 * 60 * 1000;
  const d = new Date(ts);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfToday = today.getTime();
  const diff = ts - startOfToday;
  let dayLabel;
  if (diff < 0 && diff > -DAY) dayLabel = "Today";
  else if (diff < 0) dayLabel = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  else if (diff < DAY) dayLabel = "Today";
  else if (diff < 2 * DAY) dayLabel = "Tomorrow";
  else dayLabel = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${dayLabel} · ${time}`;
}

/**
 * Format a timestamp to "HH:MM".
 * @param {number} ts
 */
export function formatTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/**
 * Debounce a function.
 * @param {(v?: any) => void} fn
 * @param {number} wait
 */
export function debounce(fn, wait) {
  let timer = null;
  return function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Simple DOM-ready helper.
 * @param {() => void} fn
 */
export function onReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

/**
 * Parse a comma-separated string into trimmed tags.
 * @param {string} raw
 * @returns {string[]}
 */
export function parseTags(raw) {
  return String(raw || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * True when running against a real Puter context where the SDK global exists.
 * @returns {boolean}
 */
export function hasPuter() {
  return typeof puter !== "undefined" && puter != null;
}
