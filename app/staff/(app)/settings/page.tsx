"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Building2, MapPin, Phone, RotateCcw, Save, UserPlus } from "lucide-react";
import { Avatar } from "@/components/brand/avatar";
import { PageHeader, Restricted } from "@/components/staff/bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { APPLICATION_FEE, CENTRE, SWIMMING } from "@/lib/constants";
import { getProgrammes, getStaff, resetDemo, saveProgrammes, useData } from "@/lib/data";
import { useRole } from "@/lib/role";
import type { Programme } from "@/lib/types";
import { rand } from "@/lib/utils";

export default function SettingsPage() {
  const loaded = useData(getProgrammes);
  const staff = useData(getStaff) ?? [];
  const { can } = useRole();
  const [edits, setProgs] = useState<Programme[] | null>(null);
  const progs = edits ?? loaded ?? [];
  const editable = can("editSettings");

  const save = async () => {
    await saveProgrammes(progs);
    toast.success("Prices saved", { description: "The parent form now shows the new prices." });
  };

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Settings" description="Programmes, sites and staff." />

      <Card>
        <CardHeader className="flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Programmes and prices</CardTitle>
            <CardDescription>
              Monthly prices, Monday to Friday excluding public holidays. Swimming {rand(SWIMMING.pricePerTerm)} per term ·
              application fee {rand(APPLICATION_FEE)} · 10% sibling discount.
            </CardDescription>
          </div>
          {editable && (
            <Button size="sm" onClick={save}>
              <Save aria-hidden /> Save prices
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {/* Phones: stacked */}
          <ul className="divide-y divide-border border-t border-border md:hidden">
            {progs.map((p, i) => (
              <li key={p.id} className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm">{p.hours}</p>
                    {p.extraHours && <p className="text-xs text-muted-foreground">{p.extraHours}</p>}
                  </div>
                  {!editable && <p className="font-display text-lg font-semibold">{rand(p.pricePerMonth)}</p>}
                </div>
                <p className="text-sm text-muted-foreground">{p.inclusions}</p>
                {editable && (
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Price / month</span>
                    <span className="relative w-32">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R</span>
                      <Input
                        type="number"
                        min={0}
                        step={50}
                        value={p.pricePerMonth}
                        onChange={(e) =>
                          setProgs(progs.map((x, j) => (j === i ? { ...x, pricePerMonth: Number(e.target.value) } : x)))
                        }
                        className="h-9 pl-7"
                      />
                    </span>
                  </label>
                )}
              </li>
            ))}
          </ul>
          <div className="hidden md:block">
          <Table>
            <THead>
              <tr>
                <TH>Programme</TH>
                <TH>Hours</TH>
                <TH className="hidden md:table-cell">Includes</TH>
                <TH className="w-36">Price / month</TH>
              </tr>
            </THead>
            <TBody>
              {progs.map((p, i) => (
                <TR key={p.id}>
                  <TD className="font-medium">{p.name}</TD>
                  <TD className="whitespace-nowrap">
                    {p.hours}
                    {p.extraHours && <span className="block text-xs text-muted-foreground">{p.extraHours}</span>}
                  </TD>
                  <TD className="hidden text-muted-foreground md:table-cell">{p.inclusions}</TD>
                  <TD>
                    {editable ? (
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R</span>
                        <Input
                          type="number"
                          min={0}
                          step={50}
                          aria-label={`${p.name} price per month`}
                          value={p.pricePerMonth}
                          onChange={(e) =>
                            setProgs(progs.map((x, j) => (j === i ? { ...x, pricePerMonth: Number(e.target.value) } : x)))
                          }
                          className="h-9 pl-7"
                        />
                      </div>
                    ) : (
                      rand(p.pricePerMonth)
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-5 md:grid-cols-2" aria-label="Sites">
        {CENTRE.sites.map((s) => (
          <Card key={s.id}>
            <CardHeader className="flex-row items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-orange-soft text-orange-ink">
                <Building2 className="size-5" aria-hidden />
              </span>
              <div>
                <CardTitle>{s.name}</CardTitle>
                <CardDescription>Site</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <p className="flex gap-2">
                <MapPin className="size-4 text-muted-foreground" aria-hidden /> {s.address}
              </p>
              <p className="flex gap-2">
                <Phone className="size-4 text-muted-foreground" aria-hidden /> {s.tel}
                {s.cell && ` · ${s.cell}`}
              </p>
              <p className="mt-2 rounded-xl border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
                Placeholder: class lists, capacity per class and site-specific staff will live here in production.
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Staff</CardTitle>
            <CardDescription>Who can sign in, and what they can see.</CardDescription>
          </div>
          {editable && (
            <Button variant="outline" size="sm" onClick={() => toast.info("Demo: invitations are sent by email in production.")}>
              <UserPlus aria-hidden /> Invite staff member
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {staff.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <Avatar name={m.name} className="size-9" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{m.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {m.title} · {m.site}
                  </p>
                </div>
                <Badge tone={m.role === "admin" ? "green" : "blue"}>{m.role === "admin" ? "Admin" : "Staff"}</Badge>
              </li>
            ))}
          </ul>
          <div className="grid gap-3 border-t border-border p-5 text-sm md:grid-cols-2">
            <div className="rounded-xl bg-green-soft p-3 text-green-ink">
              <p className="font-semibold">Admin</p>
              <p>Everything: full health detail, documents, ID and medical aid numbers, prices, CSV export.</p>
            </div>
            <div className="rounded-xl bg-blue-soft p-3 text-blue-ink">
              <p className="font-semibold">Staff</p>
              <p>Child, guardian contact details, emergency contacts, allergies and emergency info. Can update status and add notes.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {editable ? (
        <Card>
          <CardHeader>
            <CardTitle>Demo data</CardTitle>
            <CardDescription>Put the 25 sample children back and remove anything submitted during the demo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={async () => {
                await resetDemo();
                toast.success("Demo data reset");
              }}
            >
              <RotateCcw aria-hidden /> Reset demo data
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Restricted title="Editing settings is Admin only" />
      )}
    </main>
  );
}
