"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { Role } from "./types";

const KEY = "lil-angels-demo:role";

interface RoleCtx {
  role: Role | null;
  ready: boolean;
  setRole: (r: Role | null) => void;
  actor: string;
  can: (perm: Permission) => boolean;
}

/**
 * Permission matrix for the "staff roles" mock.
 * Admin sees everything. Staff see contact + emergency info, but not full
 * medical detail, uploaded documents or unmasked ID numbers.
 */
export type Permission = "viewFullHealth" | "viewDocuments" | "revealIds" | "editSettings" | "changeStatus" | "exportCsv";

const MATRIX: Record<Role, Permission[]> = {
  admin: ["viewFullHealth", "viewDocuments", "revealIds", "editSettings", "changeStatus", "exportCsv"],
  staff: ["changeStatus"],
};

const Ctx = createContext<RoleCtx | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const saved = window.localStorage.getItem(KEY) as Role | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRoleState(saved === "admin" || saved === "staff" ? saved : null);
    setReady(true);
  }, []);
  const setRole = (r: Role | null) => {
    if (r) window.localStorage.setItem(KEY, r);
    else window.localStorage.removeItem(KEY);
    setRoleState(r);
  };
  const actor = role === "admin" ? "Thandi (Admin)" : role === "staff" ? "Busi (Staff)" : "Unknown";
  const can = (p: Permission) => (role ? MATRIX[role].includes(p) : false);
  return <Ctx.Provider value={{ role, ready, setRole, actor, can }}>{children}</Ctx.Provider>;
}

export function useRole() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useRole must be used inside RoleProvider");
  return c;
}
