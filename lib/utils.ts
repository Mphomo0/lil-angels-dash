import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AgeGroup, DocumentKey, Programme, Registration } from "./types";
import { DOCUMENTS, SIBLING_DISCOUNT, SWIMMING } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function rand(amount: number) {
  return `R${amount.toLocaleString("en-ZA", { maximumFractionDigits: 0 }).replace(/,/g, " ")}`;
}

export function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-ZA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ageInMonths(dob: string, at = new Date()) {
  const d = new Date(dob);
  let months = (at.getFullYear() - d.getFullYear()) * 12 + (at.getMonth() - d.getMonth());
  if (at.getDate() < d.getDate()) months -= 1;
  return Math.max(0, months);
}

export function formatAge(dob: string) {
  const m = ageInMonths(dob);
  if (m < 12) return `${m} month${m === 1 ? "" : "s"}`;
  const y = Math.floor(m / 12);
  const rest = m % 12;
  if (y < 3 && rest > 0) return `${y} yr ${rest} mo`;
  return `${y} year${y === 1 ? "" : "s"}`;
}

export function ageGroupFor(dob: string, programme?: string): AgeGroup {
  if (programme === "aftercare") return "aftercare";
  const m = ageInMonths(dob);
  if (m < 12) return "baby";
  if (m < 30) return "toddler";
  if (m < 48) return "grade-00";
  if (m < 60) return "grade-0";
  if (m < 72) return "grade-r";
  return "aftercare";
}

export function childName(r: Pick<Registration, "child">) {
  return `${r.child.fullName} ${r.child.surname}`.trim();
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Documents that apply to this registration (father docs drop out for single guardians). */
export function requiredDocuments(r: Pick<Registration, "singleGuardian">) {
  return DOCUMENTS.filter((d) => !(r.singleGuardian && d.who === "father"));
}

export function documentProgress(r: Pick<Registration, "singleGuardian" | "documents">) {
  const req = requiredDocuments(r);
  const received = req.filter((d) => r.documents[d.key as DocumentKey]?.received).length;
  return { received, total: req.length, complete: received === req.length };
}

/** Mask everything except the last 3 characters. */
export function mask(value: string, visible = 3) {
  if (!value) return "—";
  const clean = value.replace(/\s/g, "");
  if (clean.length <= visible) return "•".repeat(clean.length);
  return "•".repeat(Math.min(10, clean.length - visible)) + clean.slice(-visible);
}

export function calculateFees(
  programme: Programme | undefined,
  opts: { swimming: boolean; siblingDiscount: boolean },
) {
  const monthly = programme?.pricePerMonth ?? 0;
  const discount = opts.siblingDiscount ? Math.round(monthly * SIBLING_DISCOUNT) : 0;
  return {
    monthly,
    discount,
    monthlyTotal: monthly - discount,
    swimmingPerTerm: opts.swimming ? SWIMMING.pricePerTerm : 0,
  };
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
