"use client";

import { useSyncExternalStore } from "react";

/**
 * Local-only accounts. Everything lives in this browser's localStorage, so this separates
 * people who share a device but is not server-side security.
 */
export interface Session {
  id: string;
  name: string;
  email: string;
}

interface StoredUser extends Session {
  salt: string;
  hash: string;
}

const USERS_KEY = "actflow:users";
const SESSION_KEY = "actflow:session";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

let sessionCache: { raw: string | null; value: Session | null } | null = null;

export function getSession(): Session | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
  if (sessionCache?.raw === raw) return sessionCache.value;
  let value: Session | null = null;
  try {
    value = raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    value = null;
  }
  sessionCache = { raw, value };
  return value;
}

export function subscribeSession(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === SESSION_KEY || e.key === null) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function users(): Record<string, StoredUser> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "{}") as Record<string, StoredUser>;
  } catch {
    return {};
  }
}

async function hash(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function start(u: StoredUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id: u.id, name: u.name, email: u.email }));
  emit();
}

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function signUp(name: string, email: string, password: string): Promise<AuthResult> {
  const key = email.trim().toLowerCase();
  if (!name.trim()) return { ok: false, error: "Enter your name." };
  if (!/^\S+@\S+\.\S+$/.test(key)) return { ok: false, error: "Enter a valid email address." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  const all = users();
  if (all[key]) return { ok: false, error: "An account with this email already exists. Sign in instead." };
  const salt = crypto.randomUUID();
  const user: StoredUser = {
    id: crypto.randomUUID().slice(0, 12),
    name: name.trim(),
    email: key,
    salt,
    hash: await hash(password, salt),
  };
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify({ ...all, [key]: user }));
    start(user);
  } catch {
    return { ok: false, error: "Your browser blocked local storage, so accounts can't be saved." };
  }
  return { ok: true };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const user = users()[email.trim().toLowerCase()];
  if (!user || (await hash(password, user.salt)) !== user.hash) {
    return { ok: false, error: "Email or password is incorrect." };
  }
  start(user);
  return { ok: true };
}

export function signOut() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
  emit();
}

/** `session` is undefined until the browser has been read, null when signed out. */
export function useAuth() {
  const session = useSyncExternalStore<Session | null | undefined>(
    subscribeSession,
    getSession,
    () => undefined,
  );
  return { session, signUp, signIn, signOut };
}

/** Everyone who has an account in this browser (no emails or hashes). */
export function listUsers(): Pick<Session, "id" | "name">[] {
  return Object.values(users()).map((u) => ({ id: u.id, name: u.name }));
}
