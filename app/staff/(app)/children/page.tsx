"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Phone, Search, UserCheck, X } from "lucide-react";
import { Avatar } from "@/components/brand/avatar";
import { PageHeader } from "@/components/staff/bits";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Choice } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { AGE_GROUPS, AGE_GROUP_LABEL, PROGRAMME_SHORT } from "@/lib/constants";
import { getChildren, useData } from "@/lib/data";
import type { AgeGroup } from "@/lib/types";
import { ageGroupFor, childName, cn, formatAge } from "@/lib/utils";

/**
 * Enrolled children only – the day-to-day list for staff.
 * Applications (new / waitlist / accepted / declined) stay on the Registrations page.
 */
export default function ChildrenPage() {
  const regs = useData(getChildren);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<AgeGroup | "">("");
  const [programme, setProgramme] = useState("");
  const [allergiesOnly, setAllergiesOnly] = useState(false);

  const enrolled = useMemo(
    () =>
      (regs ?? [])
        .filter((r) => r.status === "enrolled")
        .sort((a, b) => childName(a).localeCompare(childName(b))),
    [regs],
  );

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return enrolled.filter((r) => {
      if (group && ageGroupFor(r.child.dateOfBirth, r.programme) !== group) return false;
      if (programme && r.programme !== programme) return false;
      if (allergiesOnly && !r.health.allergies && !r.health.emergencyInfo) return false;
      if (!needle) return true;
      return [childName(r), r.mother.fullName, r.father?.fullName ?? "", r.collector?.fullName ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [enrolled, q, group, programme, allergiesOnly]);

  const pg = usePagination(rows, JSON.stringify([q, group, programme, allergiesOnly]));
  const groupCount = (g: AgeGroup) => enrolled.filter((r) => ageGroupFor(r.child.dateOfBirth, r.programme) === g).length;
  const anyFilter = q || group || programme || allergiesOnly;
  const tel = (n: string) => `tel:${n.replace(/\s/g, "")}`;

  return (
    <main className="flex flex-col gap-5 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Children"
        description={
          regs
            ? `${enrolled.length} enrolled children${anyFilter ? ` · ${rows.length} shown` : ""}. Applications are under Registrations.`
            : "Loading…"
        }
      />

      <div role="group" aria-label="Filter by class" className="hidden flex-wrap gap-2 sm:flex">
        <ClassChip active={group === ""} onClick={() => setGroup("")} label="All classes" count={enrolled.length} />
        {AGE_GROUPS.map((g) => (
          <ClassChip key={g.id} active={group === g.id} onClick={() => setGroup(g.id)} label={g.label} count={groupCount(g.id)} />
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 md:flex-row md:flex-wrap md:items-center">
        <div className="relative flex-1 md:min-w-64">
          <label htmlFor="child-search" className="sr-only">
            Search children
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            id="child-search"
            type="search"
            placeholder="Search child or parent name"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          aria-label="Filter by class"
          value={group}
          onChange={(e) => setGroup(e.target.value as AgeGroup | "")}
          className="sm:hidden"
        >
          <option value="">All classes ({enrolled.length})</option>
          {AGE_GROUPS.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label} ({groupCount(g.id)})
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
        <Choice
          type="checkbox"
          checked={allergiesOnly}
          onChange={(e) => setAllergiesOnly(e.target.checked)}
          label="Allergies / alerts only"
          className="py-2"
        />
        {anyFilter && (
          <Button
            variant="ghost"
            onClick={() => {
              setQ("");
              setGroup("");
              setProgramme("");
              setAllergiesOnly(false);
            }}
          >
            <X aria-hidden /> Clear
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        {/* Phones: one card per child */}
        <ul className="divide-y divide-border md:hidden" aria-label="Enrolled children">
          {pg.pageItems.map((r) => {
            const { allergies, emergencyInfo } = r.health;
            const repeats = allergies && emergencyInfo.toLowerCase().includes(allergies.toLowerCase());
            const alert = repeats ? [emergencyInfo] : [allergies, emergencyInfo].filter(Boolean);
            return (
              <li key={r.id} className="flex flex-col gap-3 p-4">
                <Link href={`/staff/children/${r.id}`} className="flex items-center gap-3">
                  <Avatar name={childName(r)} className="size-10" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{childName(r)}</span>
                    <span className="block text-xs text-muted-foreground">
                      {AGE_GROUP_LABEL[ageGroupFor(r.child.dateOfBirth, r.programme)]} · {formatAge(r.child.dateOfBirth)} ·{" "}
                      {PROGRAMME_SHORT[r.programme]}
                    </span>
                  </span>
                </Link>
                {alert.length > 0 && (
                  <Badge tone="red" className="self-start whitespace-normal">
                    <AlertTriangle aria-hidden /> {alert.join(" · ")}
                  </Badge>
                )}
                <p className="text-sm">
                  <span className="text-muted-foreground">Collected by: </span>
                  Parents
                  {r.collector ? (
                    <span className="text-green-ink">
                      {" "}
                      and {r.collector.fullName} ({r.collector.relationship})
                    </span>
                  ) : (
                    " only"
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {[r.mother, ...(r.father ? [r.father] : [])].map((g) => (
                    <a
                      key={g.fullName}
                      href={tel(g.cell)}
                      className={cn(buttonVariants({ variant: "soft", size: "sm" }))}
                      aria-label={`Call ${g.fullName} on ${g.cell}`}
                    >
                      <Phone aria-hidden /> {g.fullName.split(" ")[0]} · {g.cell}
                    </a>
                  ))}
                </div>
              </li>
            );
          })}
          {regs && rows.length === 0 && (
            <li className="p-8 text-center text-muted-foreground">
              {enrolled.length ? "No enrolled children match these filters." : "No children are enrolled yet."}
            </li>
          )}
        </ul>
        {/* Tablets and up: full table */}
        <div className="hidden md:block">
        <Table>
          <caption className="sr-only">Enrolled children</caption>
          <THead>
            <tr>
              <TH>Child</TH>
              <TH>Class</TH>
              <TH>Allergies / alerts</TH>
              <TH>Who may collect</TH>
              <TH>Parents</TH>
            </tr>
          </THead>
          <TBody>
            {pg.pageItems.map((r) => {
              const { allergies, emergencyInfo } = r.health;
              // Don't repeat the allergy if the emergency note already mentions it.
              const repeats = allergies && emergencyInfo.toLowerCase().includes(allergies.toLowerCase());
              const alert = repeats ? [emergencyInfo] : [allergies, emergencyInfo].filter(Boolean);
              return (
                <TR key={r.id} className="cursor-pointer" onClick={() => router.push(`/staff/children/${r.id}`)}>
                  <TD>
                    <Link
                      href={`/staff/children/${r.id}`}
                      className="flex items-center gap-3 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Avatar name={childName(r)} className="size-9" />
                      <span>
                        <span className="block font-medium">{childName(r)}</span>
                        <span className="block text-xs text-muted-foreground">{formatAge(r.child.dateOfBirth)}</span>
                      </span>
                    </Link>
                  </TD>
                  <TD className="whitespace-nowrap">
                    {AGE_GROUP_LABEL[ageGroupFor(r.child.dateOfBirth, r.programme)]}
                    <span className="block text-xs text-muted-foreground">
                      {PROGRAMME_SHORT[r.programme]}
                      {r.swimming ? " · swimming" : ""}
                    </span>
                  </TD>
                  <TD>
                    {alert.length ? (
                      <Badge tone="red" className="whitespace-normal">
                        <AlertTriangle aria-hidden /> {alert.join(" · ")}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">None</span>
                    )}
                  </TD>
                  <TD className="text-sm">
                    <span className="block text-muted-foreground">Parents{r.collector ? " and:" : " only"}</span>
                    {r.collector ? (
                      <span className="inline-flex items-center gap-1 text-green-ink">
                        <UserCheck className="size-3.5" aria-hidden /> {r.collector.fullName} ({r.collector.relationship})
                      </span>
                    ) : null}
                  </TD>
                  <TD>
                    <div className="flex flex-col gap-1">
                      {[r.mother, ...(r.father ? [r.father] : [])].map((g) => (
                        <span key={g.fullName} className="flex items-center gap-2">
                          <span className="hidden w-16 truncate text-xs text-muted-foreground xl:inline">{g.fullName.split(" ")[0]}</span>
                          <a
                            href={tel(g.cell)}
                            onClick={(e) => e.stopPropagation()}
                            className={cn(buttonVariants({ variant: "soft", size: "sm" }), "h-8 px-2.5 xl:px-3")}
                            aria-label={`Call ${g.fullName} on ${g.cell}`}
                          >
                            <Phone aria-hidden /> {g.cell}
                          </a>
                        </span>
                      ))}
                    </div>
                  </TD>
                </TR>
              );
            })}
            {regs && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-muted-foreground">
                  {enrolled.length ? "No enrolled children match these filters." : "No children are enrolled yet."}
                </td>
              </tr>
            )}
          </TBody>
        </Table>
        </div>
        <Pagination p={pg} label="Children pages" noun="children" />
      </div>
      <p className="text-xs text-muted-foreground">
        Sorted by name. A child appears here once their registration is marked <strong>Enrolled</strong> on the
        Registrations page.
      </p>
    </main>
  );
}

function ClassChip({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 rounded-full border-2 px-4 py-1.5 text-sm font-medium transition-colors",
        active ? "border-green-ink bg-green-soft text-green-ink" : "border-border bg-white text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      <span className={cn("rounded-full px-1.5 text-xs", active ? "bg-white" : "bg-muted")}>{count}</span>
    </button>
  );
}

