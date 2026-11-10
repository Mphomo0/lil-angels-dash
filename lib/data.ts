"use client";
/**
 * Data layer for the demo.
 *
 * Everything the UI needs goes through these async functions. Today they read
 * and write the browser's localStorage (seeded from lib/seed.ts). To go to
 * production, swap the bodies for fetch() calls / Server Actions backed by
 * Neon Postgres. The function signatures are the contract; the UI does not
 * need to change.
 */
import { useEffect, useRef, useState } from "react";
import { DEFAULT_PROGRAMMES } from "./constants";
import { buildSeed, SEED_STAFF } from "./seed";
import type {
  DocumentKey,
  Programme,
  Registration,
  RegistrationInput,
  StaffMember,
  Status,
} from "./types";
import { uid } from "./utils";

const STORE_KEY = "lil-angels-demo:v1";
const CHANGE_EVENT = "lil-angels-demo:change";

interface Store {
  registrations: Registration[];
  programmes: Programme[];
  staff: StaffMember[];
  nextNumber: number;
}

function freshStore(): Store {
  return {
    registrations: buildSeed(),
    programmes: DEFAULT_PROGRAMMES,
    staff: SEED_STAFF,
    nextNumber: 201,
  };
}

function read(): Store {
  if (typeof window === "undefined") return freshStore();
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as Store;
  } catch {
    // fall through to a fresh seed
  }
  const s = freshStore();
  write(s, false);
  return s;
}

function write(s: Store, notify = true) {
  window.localStorage.setItem(STORE_KEY, JSON.stringify(s));
  if (notify) window.dispatchEvent(new Event(CHANGE_EVENT));
}

function mutate(id: string, fn: (r: Registration) => void) {
  const s = read();
  const r = s.registrations.find((x) => x.id === id);
  if (!r) throw new Error(`Registration ${id} not found`);
  fn(r);
  write(s);
  return r;
}

const delay = () => new Promise((res) => setTimeout(res, 120));

// ---------------------------------------------------------------- queries

export async function getChildren(): Promise<Registration[]> {
  await delay();
  return read().registrations.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export async function getChild(id: string): Promise<Registration | null> {
  await delay();
  return read().registrations.find((r) => r.id === id) ?? null;
}

export async function getProgrammes(): Promise<Programme[]> {
  return read().programmes;
}

export async function getStaff(): Promise<StaffMember[]> {
  return read().staff;
}

// ---------------------------------------------------------------- commands

export async function createRegistration(input: RegistrationInput): Promise<Registration> {
  await delay();
  const s = read();
  const now = new Date();
  const reg: Registration = {
    ...input,
    id: uid("child"),
    registrationNumber: `LA-${now.getFullYear()}-${String(s.nextNumber).padStart(4, "0")}`,
    status: "new",
    submittedAt: now.toISOString(),
    notes: [],
    activity: [
      { id: uid("a"), at: now.toISOString(), actor: "Parent (online form)", text: "Application submitted online" },
    ],
  };
  s.nextNumber += 1;
  s.registrations.unshift(reg);
  write(s);
  return reg;
}

export async function updateStatus(id: string, status: Status, actor: string) {
  return mutate(id, (r) => {
    if (r.status === status) return;
    r.status = status;
    if ((status === "accepted" || status === "enrolled") && !r.admissionDate) {
      r.admissionDate = new Date().toISOString().slice(0, 10);
    }
    r.activity.unshift({
      id: uid("a"),
      at: new Date().toISOString(),
      actor,
      text: `Status changed to ${status[0].toUpperCase()}${status.slice(1)}`,
    });
  });
}

export async function addNote(id: string, text: string, author: string) {
  return mutate(id, (r) => {
    const at = new Date().toISOString();
    r.notes.unshift({ id: uid("n"), at, author, text });
    r.activity.unshift({ id: uid("a"), at, actor: author, text: "Added a note" });
  });
}

export async function setDocumentReceived(id: string, key: DocumentKey, received: boolean, actor: string) {
  return mutate(id, (r) => {
    r.documents[key] = { ...r.documents[key], received };
    r.activity.unshift({
      id: uid("a"),
      at: new Date().toISOString(),
      actor,
      text: `Marked "${key}" as ${received ? "received" : "missing"}`,
    });
  });
}

/** Audit trail entry, e.g. when someone reveals a masked ID number. */
export async function logActivity(id: string, text: string, actor: string) {
  return mutate(id, (r) => {
    r.activity.unshift({ id: uid("a"), at: new Date().toISOString(), actor, text });
  });
}

export async function saveProgrammes(programmes: Programme[]) {
  const s = read();
  s.programmes = programmes;
  write(s);
}

export async function resetDemo() {
  write(freshStore());
}

// ---------------------------------------------------------------- hooks

/** Re-runs `load` whenever the demo store changes (in this tab or another). */
export function useData<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | undefined>(undefined);
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });
  const key = JSON.stringify(deps);

  useEffect(() => {
    let alive = true;
    const go = () => loadRef.current().then((d) => alive && setData(d));
    go();
    const onStorage = (e: StorageEvent) => e.key === STORE_KEY && go();
    window.addEventListener(CHANGE_EVENT, go);
    window.addEventListener("storage", onStorage);
    return () => {
      alive = false;
      window.removeEventListener(CHANGE_EVENT, go);
      window.removeEventListener("storage", onStorage);
    };
  }, [key]);

  return data;
}
