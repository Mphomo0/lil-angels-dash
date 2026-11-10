"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarPlus, CheckCircle2, ClipboardCheck, FileWarning, Hourglass, Sparkles } from "lucide-react";
import { Avatar } from "@/components/brand/avatar";
import { DocsIndicator, PageHeader } from "@/components/staff/bits";
import { StatusBadge } from "@/components/staff/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AGE_GROUPS, PROGRAMME_SHORT, STATUSES } from "@/lib/constants";
import { getChildren, useData } from "@/lib/data";
import type { Status } from "@/lib/types";
import { ageGroupFor, childName, cn, documentProgress, formatAge, formatDateTime } from "@/lib/utils";

const PIPE_COLOURS: Record<Status, string> = {
  new: "bg-blue",
  waitlist: "bg-orange",
  accepted: "bg-purple",
  enrolled: "bg-green",
  declined: "bg-[#c9c2b0]",
};

export default function Overview() {
  const regs = useData(getChildren);
  const [now] = useState(() => Date.now());

  if (!regs) return <Skeleton />;

  const weekAgo = now - 7 * 86_400_000;
  const count = (s: Status) => regs.filter((r) => r.status === s).length;
  const newThisWeek = regs.filter((r) => new Date(r.submittedAt).getTime() >= weekAgo).length;
  const incomplete = regs.filter((r) => r.status !== "declined" && !documentProgress(r).complete).length;

  const cards = [
    { label: "New this week", value: newThisWeek, icon: Sparkles, tone: "bg-blue-soft text-blue-ink", href: "/staff/registrations?status=new" },
    { label: "Waitlist", value: count("waitlist"), icon: Hourglass, tone: "bg-orange-soft text-orange-ink", href: "/staff/registrations?status=waitlist" },
    { label: "Accepted", value: count("accepted"), icon: ClipboardCheck, tone: "bg-purple-soft text-purple-ink", href: "/staff/registrations?status=accepted" },
    { label: "Enrolled", value: count("enrolled"), icon: CheckCircle2, tone: "bg-green-soft text-green-ink", href: "/staff/children" },
    { label: "Incomplete documents", value: incomplete, icon: FileWarning, tone: "bg-pink-soft text-pink-ink", href: "/staff/registrations?docs=incomplete" },
  ];

  const active = regs.filter((r) => r.status !== "declined");
  const total = regs.length;

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Good day 👋"
        description="Here's what's happening with registrations."
        actions={
          <Link href="/staff/registrations" className={buttonVariants({ variant: "outline" })}>
            All registrations <ArrowRight aria-hidden />
          </Link>
        }
      />

      <section aria-label="Summary" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {cards.map(({ label, value, icon: Icon, tone, href }) => (
          <Link
            key={label}
            href={href}
            className="group flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 transition-shadow hover:shadow-md"
          >
            <span className={cn("inline-flex size-9 items-center justify-center rounded-xl", tone)}>
              <Icon className="size-4.5" aria-hidden />
            </span>
            <span className="font-display text-3xl font-semibold">{value}</span>
            <span className="text-sm text-muted-foreground group-hover:text-foreground">{label}</span>
          </Link>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem] [&>*]:min-w-0">
        <Card>
          <CardHeader>
            <CardTitle>Latest applications</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {regs.slice(0, 7).map((r) => (
                <li key={r.id}>
                  <Link href={`/staff/children/${r.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-cream">
                    <Avatar name={childName(r)} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{childName(r)}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {formatAge(r.child.dateOfBirth)} · {PROGRAMME_SHORT[r.programme]} · {formatDateTime(r.submittedAt)}
                      </p>
                    </div>
                    <span className="hidden sm:inline">
                      <DocsIndicator registration={r} />
                    </span>
                    <StatusBadge status={r.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex h-3 overflow-hidden rounded-full bg-muted" aria-hidden>
                {STATUSES.map((s) => (
                  <div key={s.id} className={PIPE_COLOURS[s.id]} style={{ width: `${(count(s.id) / total) * 100}%` }} />
                ))}
              </div>
              <ul className="grid grid-cols-2 gap-2 text-sm">
                {STATUSES.map((s) => (
                  <li key={s.id} className="flex items-center gap-2">
                    <span className={cn("size-2.5 rounded-full", PIPE_COLOURS[s.id])} aria-hidden />
                    {s.label}
                    <span className="ml-auto font-semibold">{count(s.id)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>By age group</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2.5 text-sm">
                {AGE_GROUPS.map((g) => {
                  const n = active.filter((r) => ageGroupFor(r.child.dateOfBirth, r.programme) === g.id).length;
                  const max = Math.max(1, ...AGE_GROUPS.map((x) => active.filter((r) => ageGroupFor(r.child.dateOfBirth, r.programme) === x.id).length));
                  return (
                    <li key={g.id} className="grid grid-cols-[5.5rem_1fr_1.5rem] items-center gap-2">
                      <span>{g.label}</span>
                      <span className="h-2 overflow-hidden rounded-full bg-muted">
                        <span className="block h-full rounded-full bg-green" style={{ width: `${(n / max) * 100}%` }} />
                      </span>
                      <span className="text-right font-semibold">{n}</span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          <Link
            href="/register"
            className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-green/60 p-4 text-sm hover:bg-green-soft"
          >
            <CalendarPlus className="size-5 text-green-ink" aria-hidden />
            <span>
              <span className="font-semibold">Try the parent form</span>
              <br />
              <span className="text-muted-foreground">Submit one and watch it appear here.</span>
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}

function Skeleton() {
  return (
    <main className="grid gap-4 p-8 md:grid-cols-5" aria-busy="true" aria-label="Loading">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
      ))}
    </main>
  );
}
