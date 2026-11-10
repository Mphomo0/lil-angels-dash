"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/brand/avatar";
import { DocsIndicator, PageHeader, StatusSelect } from "@/components/staff/bits";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { AGE_GROUPS, AGE_GROUP_LABEL, PROGRAMME_SHORT, STATUSES, STATUS_LABEL } from "@/lib/constants";
import { getChildren, useData } from "@/lib/data";
import { useRole } from "@/lib/role";
import type { Registration } from "@/lib/types";
import { ageGroupFor, ageInMonths, childName, documentProgress, formatAge, formatDate } from "@/lib/utils";

type SortKey = "child" | "age" | "programme" | "submitted" | "status" | "docs";
const STATUS_ORDER = Object.fromEntries(STATUSES.map((s, i) => [s.id, i]));

export default function RegistrationsPage() {
  const regs = useData(getChildren);
  const { can } = useRole();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [programme, setProgramme] = useState("");
  const [age, setAge] = useState("");
  const [docs, setDocs] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "submitted", dir: -1 });

  // Pick up filters from overview card links (?status=waitlist, ?docs=incomplete).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    /* eslint-disable react-hooks/set-state-in-effect */
    if (p.get("status")) setStatus(p.get("status")!);
    if (p.get("docs")) setDocs(p.get("docs")!);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const rows = useMemo(() => {
    if (!regs) return [];
    const needle = q.trim().toLowerCase();
    const filtered = regs.filter((r) => {
      if (status && r.status !== status) return false;
      if (programme && r.programme !== programme) return false;
      if (age && ageGroupFor(r.child.dateOfBirth, r.programme) !== age) return false;
      if (docs === "incomplete" && (documentProgress(r).complete || r.status === "declined")) return false;
      if (docs === "complete" && !documentProgress(r).complete) return false;
      if (!needle) return true;
      return [childName(r), r.registrationNumber, r.mother.fullName, r.father?.fullName ?? "", r.mother.email]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
    const val = (r: Registration): string | number => {
      switch (sort.key) {
        case "child":
          return childName(r).toLowerCase();
        case "age":
          return ageInMonths(r.child.dateOfBirth);
        case "programme":
          return r.programme;
        case "status":
          return STATUS_ORDER[r.status];
        case "docs":
          return documentProgress(r).received / documentProgress(r).total;
        default:
          return r.submittedAt;
      }
    };
    return [...filtered].sort((a, b) => (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * sort.dir);
  }, [regs, q, status, programme, age, docs, sort]);

  const pg = usePagination(rows, JSON.stringify([q, status, programme, age, docs, sort]));
  const anyFilter = q || status || programme || age || docs;
  const clear = () => {
    setQ("");
    setStatus("");
    setProgramme("");
    setAge("");
    setDocs("");
    window.history.replaceState(null, "", "/staff/registrations");
  };

  const exportCsv = () => {
    // Deliberately minimal: no ID numbers, health or medical aid data in exports.
    const header = ["Registration no", "Child", "Date of birth", "Age group", "Programme", "Status", "Submitted", "Documents", "Mother / guardian", "Cell", "Email"];
    const lines = rows.map((r) => {
      const d = documentProgress(r);
      return [
        r.registrationNumber,
        childName(r),
        r.child.dateOfBirth,
        AGE_GROUP_LABEL[ageGroupFor(r.child.dateOfBirth, r.programme)],
        PROGRAMME_SHORT[r.programme],
        STATUS_LABEL[r.status],
        r.submittedAt.slice(0, 10),
        `${d.received}/${d.total}`,
        r.mother.fullName,
        r.mother.cell,
        r.mother.email,
      ];
    });
    const csv = [header, ...lines].map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `lil-angels-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} registrations`);
  };

  return (
    <main className="flex flex-col gap-5 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Registrations"
        description={regs ? `${rows.length} of ${regs.length} shown` : "Loading…"}
        actions={
          <Button variant="outline" onClick={exportCsv} disabled={!can("exportCsv") || !rows.length} title={can("exportCsv") ? undefined : "Admins only"}>
            <Download aria-hidden /> Export CSV
          </Button>
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 md:flex-row md:flex-wrap md:items-end">
        <div className="relative flex-1 md:min-w-64">
          <label htmlFor="search" className="sr-only">
            Search registrations
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input id="search" type="search" placeholder="Search child, parent or reg. number" value={q} onChange={(e) => setQ(e.target.value)} className="pl-10" />
        </div>
        <Select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} className="md:w-40">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
        <Select aria-label="Filter by programme" value={programme} onChange={(e) => setProgramme(e.target.value)} className="md:w-40">
          <option value="">All programmes</option>
          {Object.entries(PROGRAMME_SHORT).map(([id, l]) => (
            <option key={id} value={id}>
              {l}
            </option>
          ))}
        </Select>
        <Select aria-label="Filter by age group" value={age} onChange={(e) => setAge(e.target.value)} className="md:w-40">
          <option value="">All age groups</option>
          {AGE_GROUPS.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </Select>
        <Select aria-label="Filter by documents" value={docs} onChange={(e) => setDocs(e.target.value)} className="md:w-44">
          <option value="">Any documents</option>
          <option value="incomplete">Documents missing</option>
          <option value="complete">Documents complete</option>
        </Select>
        {anyFilter && (
          <Button variant="ghost" onClick={clear}>
            <X aria-hidden /> Clear
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        {/* Phones: one card per registration */}
        <ul className="divide-y divide-border md:hidden" aria-label="Registrations">
          {pg.pageItems.map((r) => (
            <li key={r.id} className="flex flex-col gap-3 p-4">
              <Link href={`/staff/children/${r.id}`} className="flex items-center gap-3">
                <Avatar name={childName(r)} className="size-10" />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{childName(r)}</span>
                  <span className="block text-xs text-muted-foreground">
                    {r.registrationNumber} · {formatDate(r.submittedAt)}
                  </span>
                </span>
              </Link>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>
                  {formatAge(r.child.dateOfBirth)} · {AGE_GROUP_LABEL[ageGroupFor(r.child.dateOfBirth, r.programme)]}
                </span>
                <span>
                  {PROGRAMME_SHORT[r.programme]}
                  {r.swimming ? " + swimming" : ""}
                </span>
                <DocsIndicator registration={r} />
              </div>
              <StatusSelect registration={r} className="w-full" />
            </li>
          ))}
          {regs && rows.length === 0 && <li className="p-8 text-center text-muted-foreground">No registrations match these filters.</li>}
        </ul>
        {/* Tablets and up: full table */}
        <div className="hidden md:block">
        <Table>
          <caption className="sr-only">Registrations</caption>
          <THead>
            <tr>
              <SortHead sort={sort} setSort={setSort} k="child">Child</SortHead>
              <SortHead sort={sort} setSort={setSort} k="age">Age</SortHead>
              <SortHead sort={sort} setSort={setSort} k="programme">Programme</SortHead>
              <SortHead sort={sort} setSort={setSort} k="submitted" className="hidden xl:table-cell">Submitted</SortHead>
              <SortHead sort={sort} setSort={setSort} k="docs">Docs</SortHead>
              <SortHead sort={sort} setSort={setSort} k="status">Status</SortHead>
            </tr>
          </THead>
          <TBody>
            {pg.pageItems.map((r) => (
              <TR key={r.id}>
                <TD>
                  <Link href={`/staff/children/${r.id}`} className="flex items-center gap-3 hover:underline">
                    <Avatar name={childName(r)} className="size-9" />
                    <span>
                      <span className="block font-medium">{childName(r)}</span>
                      <span className="block text-xs text-muted-foreground">
                          {r.registrationNumber}
                          <span className="xl:hidden"> · {formatDate(r.submittedAt)}</span>
                        </span>
                    </span>
                  </Link>
                </TD>
                <TD className="whitespace-nowrap">
                  {formatAge(r.child.dateOfBirth)}
                  <span className="block text-xs text-muted-foreground">{AGE_GROUP_LABEL[ageGroupFor(r.child.dateOfBirth, r.programme)]}</span>
                </TD>
                <TD className="whitespace-nowrap">
                  {PROGRAMME_SHORT[r.programme]}
                  {r.swimming && <span className="block text-xs text-blue-ink">+ swimming</span>}
                </TD>
                <TD className="hidden whitespace-nowrap xl:table-cell">{formatDate(r.submittedAt)}</TD>
                <TD>
                  <DocsIndicator registration={r} />
                </TD>
                <TD>
                  <StatusSelect registration={r} />
                </TD>
              </TR>
            ))}
            {regs && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-muted-foreground">
                  No registrations match these filters.
                </td>
              </tr>
            )}
          </TBody>
        </Table>
        </div>
        <Pagination p={pg} label="Registrations pages" noun="registrations" />
      </div>
    </main>
  );
}

function SortHead({
  k,
  children,
  className,
  sort,
  setSort,
}: {
  k: SortKey;
  children: React.ReactNode;
  className?: string;
  sort: { key: SortKey; dir: 1 | -1 };
  setSort: (s: { key: SortKey; dir: 1 | -1 }) => void;
}) {
  const active = sort.key === k;
  const Icon = active ? (sort.dir === 1 ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <TH className={className} aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
      <button
        className="inline-flex cursor-pointer items-center gap-1 uppercase hover:text-foreground"
        onClick={() => setSort({ key: k, dir: active ? ((-sort.dir) as 1 | -1) : 1 })}
      >
        {children} <Icon className="size-3.5" aria-hidden />
      </button>
    </TH>
  );
}
