"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Activity as ActivityIcon,
  ArrowLeft,
  CheckCircle2,
  Circle,
  FileText,
  HeartPulse,
  Mail,
  Phone,
  PhoneCall,
  Pill,
  UserCheck,
  Printer,
  Send,
  ShieldAlert,
  StickyNote,
  UserRound,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/brand/avatar";
import { DocsIndicator, Masked, Restricted, StatusSelect } from "@/components/staff/bits";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { TabPanel, Tabs } from "@/components/ui/tabs";
import { AGE_GROUP_LABEL, DOCUMENTS, SWIMMING } from "@/lib/constants";
import { addNote, getChild, getProgrammes, logActivity, setDocumentReceived, useData } from "@/lib/data";
import { useRole } from "@/lib/role";
import type { Guardian, Registration } from "@/lib/types";
import {
  ageGroupFor,
  calculateFees,
  childName,
  cn,
  documentProgress,
  formatAge,
  formatDate,
  formatDateTime,
  rand,
  requiredDocuments,
} from "@/lib/utils";

const TABS = [
  { id: "overview", label: <><UserRound aria-hidden /> Overview</> },
  { id: "guardians", label: <><Users aria-hidden /> Guardians</> },
  { id: "health", label: <><HeartPulse aria-hidden /> Health and emergency</> },
  { id: "documents", label: <><FileText aria-hidden /> Documents</> },
  { id: "notes", label: <><StickyNote aria-hidden /> Notes and activity</> },
];

export default function ChildProfile() {
  const { id } = useParams<{ id: string }>();
  const r = useData(() => getChild(id), [id]);
  const programmes = useData(getProgrammes) ?? [];
  const [tab, setTab] = useState("overview");
  const { can, actor } = useRole();

  if (r === undefined) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  if (r === null)
    return (
      <div className="flex flex-col items-start gap-3 p-8">
        <p>We couldn&apos;t find that registration.</p>
        <Link href="/staff/registrations" className={buttonVariants({ variant: "outline" })}>
          Back to registrations
        </Link>
      </div>
    );

  const prog = programmes.find((p) => p.id === r.programme);
  const missing = requiredDocuments(r).filter((d) => !r.documents[d.key].received);

  const requestDocs = async () => {
    await logActivity(r.id, `Requested ${missing.length} missing document(s) by email`, actor);
    toast.success(`Reminder sent to ${r.mother.email}`, {
      description: `Asked for: ${missing.map((m) => m.label).join(", ")}. (Demo – no email was actually sent.)`,
    });
  };

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <Link
        href={r.status === "enrolled" ? "/staff/children" : "/staff/registrations"}
        className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> {r.status === "enrolled" ? "All children" : "All registrations"}
      </Link>

      <header className="flex flex-col gap-4 rounded-3xl border border-border bg-white p-5 sm:flex-row sm:items-center sm:p-6">
        <Avatar name={childName(r)} className="size-16 text-xl" />
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold">{childName(r)}</h1>
          <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>{formatAge(r.child.dateOfBirth)}</span>
            <span aria-hidden>·</span>
            <span>{AGE_GROUP_LABEL[ageGroupFor(r.child.dateOfBirth, r.programme)]}</span>
            <span aria-hidden>·</span>
            <span>{prog?.name}</span>
            {r.swimming && <Badge tone="blue">+ Swimming</Badge>}
            <span aria-hidden>·</span>
            <span className="font-mono">{r.registrationNumber}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusSelect registration={r} />
          <Link href={`/staff/children/${r.id}/print`} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Printer aria-hidden /> Print summary
          </Link>
        </div>
      </header>

      {r.health.emergencyInfo && (
        <p role="alert" className="flex items-center gap-2 rounded-2xl bg-red-soft px-4 py-3 text-sm font-semibold text-red-ink">
          <ShieldAlert className="size-5 shrink-0" aria-hidden /> {r.health.emergencyInfo}
        </p>
      )}

      <AtAGlance r={r} full={can("viewFullHealth")} />

      <Tabs tabs={TABS} value={tab} onChange={setTab} label="Child profile sections" />

      <TabPanel id={tab}>
        {tab === "overview" && <OverviewTab r={r} monthly={calculateFees(prog, r)} />}
        {tab === "guardians" && <GuardiansTab r={r} />}
        {tab === "health" && <HealthTab r={r} full={can("viewFullHealth")} />}
        {tab === "documents" && <DocumentsTab r={r} canOpen={can("viewDocuments")} onRequest={requestDocs} missingCount={missing.length} />}
        {tab === "notes" && <NotesTab r={r} />}
      </TabPanel>
    </main>
  );
}

/**
 * The things a teacher needs in seconds: allergies, who may collect, and who to call.
 * Shown above the tabs so it's visible whichever tab is open, for Admin and Staff.
 */
function AtAGlance({ r, full }: { r: Registration; full: boolean }) {
  const h = r.health;
  const tel = (n: string) => `tel:${n.replace(/\s/g, "")}`;
  const parents = [
    { who: "Mother / guardian", g: r.mother },
    ...(r.father ? [{ who: "Father / guardian", g: r.father }] : []),
  ];
  return (
    <section aria-labelledby="glance-title" className="flex flex-col gap-3">
      <h2 id="glance-title" className="text-lg font-semibold">
        At a glance
      </h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="border-2 border-red/30">
          <CardHeader className="flex-row items-center gap-2 pb-2">
            <Pill className="size-4 text-red-ink" aria-hidden />
            <CardTitle className="text-base">Health and safety</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Allergies</p>
              <p className={cn("mt-0.5 font-semibold", h.allergies ? "text-red-ink" : "text-muted-foreground")}>
                {h.allergies || "None noted"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">In an emergency</p>
              <p className="mt-0.5">{h.emergencyInfo || <span className="text-muted-foreground">Nothing special noted</span>}</p>
            </div>
            {h.supportConditions && (
              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Needs support with</p>
                <p className="mt-0.5">{h.supportConditions}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Medication</p>
              <p className="mt-0.5">
                {full ? (
                  h.medication || <span className="text-muted-foreground">None</span>
                ) : (
                  <span className="text-muted-foreground">Ask the office (admin only)</span>
                )}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Doctor in an emergency: family doctor {h.permissionFamilyDoctor === "yes" ? "✓" : "✗"} · nearest doctor{" "}
              {h.permissionNearestDoctor === "yes" ? "✓" : "✗"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green/40">
          <CardHeader className="flex-row items-center gap-2 pb-2">
            <UserCheck className="size-4 text-green-ink" aria-hidden />
            <CardTitle className="text-base">Who may collect</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2.5 text-sm">
              {parents.map(({ who, g }) => (
                <li key={who} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                  <span className="min-w-[8rem] flex-1">
                    <span className="block font-medium">{g.fullName}</span>
                    <span className="block text-xs text-muted-foreground">{who}</span>
                  </span>
                  <a href={tel(g.cell)} className={buttonVariants({ variant: "soft", size: "sm" })} aria-label={`Call ${g.fullName}`}>
                    <Phone aria-hidden /> {g.cell}
                  </a>
                </li>
              ))}
              {r.collector ? (
                <li className="flex flex-col gap-1 rounded-xl bg-green-soft/60 px-3 py-2">
                  <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                    <span className="min-w-[8rem] flex-1">
                      <span className="block font-medium">{r.collector.fullName}</span>
                      <span className="block text-xs text-muted-foreground">{r.collector.relationship} · authorised</span>
                    </span>
                    <a href={tel(r.collector.tel)} className={buttonVariants({ variant: "outline", size: "sm" })} aria-label={`Call ${r.collector.fullName}`}>
                      <Phone aria-hidden /> {r.collector.tel}
                    </a>
                  </span>
                  {r.collector.specialNotice && <span className="text-xs text-green-ink">Note: {r.collector.specialNotice}</span>}
                </li>
              ) : (
                <li className="text-xs text-muted-foreground">No one else is authorised. Parents / guardians only.</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue/40">
          <CardHeader className="flex-row items-center gap-2 pb-2">
            <PhoneCall className="size-4 text-blue-ink" aria-hidden />
            <CardTitle className="text-base">If we can&apos;t reach the parents</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-2.5 text-sm">
              {r.emergencyContacts.map((c, i) => (
                <li key={i} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                  <span className="min-w-[8rem] flex-1">
                    <span className="block font-medium">
                      {i + 1}. {c.name} {c.surname}
                    </span>
                    <span className="block text-xs text-muted-foreground">{c.relationship}</span>
                  </span>
                  <a href={tel(c.cell)} className={buttonVariants({ variant: "soft", size: "sm" })} aria-label={`Call ${c.name} ${c.surname}`}>
                    <Phone aria-hidden /> {c.cell}
                  </a>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-muted-foreground">Emergency contacts may not collect unless listed under &ldquo;Who may collect&rdquo;.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Dl({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {items.map(([k, v]) => (
        <div key={k}>
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{k}</dt>
          <dd className="mt-0.5 break-words">{v || <span className="text-muted-foreground">—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

function OverviewTab({ r, monthly }: { r: Registration; monthly: ReturnType<typeof calculateFees> }) {
  const docs = documentProgress(r);
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <Dl
            items={[
              ["Registration number", <span key="n" className="font-mono">{r.registrationNumber}</span>],
              ["Submitted", formatDateTime(r.submittedAt)],
              ["Admission date", formatDate(r.admissionDate)],
              ["Documents", <DocsIndicator key="d" registration={r} />],
              ["Monthly fee", `${rand(monthly.monthlyTotal)}${r.siblingDiscount ? " (10% sibling discount)" : ""}`],
              ["Swimming", r.swimming ? `${rand(SWIMMING.pricePerTerm)} per term` : "No"],
            ]}
          />
          {!docs.complete && (
            <p className="mt-4 rounded-xl bg-orange-soft px-3 py-2 text-sm text-orange-ink">
              {docs.total - docs.received} document(s) still outstanding.
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Child</CardTitle>
        </CardHeader>
        <CardContent>
          <Dl
            items={[
              ["Full name", r.child.fullName],
              ["Surname", r.child.surname],
              ["Date of birth", formatDate(r.child.dateOfBirth)],
              ["Home language", r.child.homeLanguage],
              ["Home phone", r.child.homePhone],
              ["Primary caregiver", r.child.primaryCaregiver],
              ["Children in household", `${r.child.householdChildren}${r.child.householdAges ? ` (ages ${r.child.householdAges})` : ""}`],
              ["Biological parents", r.child.biologicalParents === "yes" ? "Yes" : "No"],
              ["Home address", r.child.homeAddress],
              [
                "Previous centres",
                r.child.previousCentres.length
                  ? r.child.previousCentres.map((c) => `${c.name}, ${c.city} (${c.tel})`).join("; ")
                  : "None",
              ],
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function GuardianCard({ g, title, r }: { g: Guardian; title: string; r: Registration }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3">
        <Avatar name={g.fullName} />
        <div>
          <CardTitle>{g.fullName}</CardTitle>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${g.cell.replace(/\s/g, "")}`} className={buttonVariants({ variant: "soft", size: "sm" })}>
            <Phone aria-hidden /> {g.cell}
          </a>
          <a href={`mailto:${g.email}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Mail aria-hidden /> {g.email}
          </a>
        </div>
        <Dl
          items={[
            ["ID number", <Masked key="id" value={g.idNumber} label={`${title} ID number`} registrationId={r.id} />],
            ["Marital status", g.maritalStatus],
            ["Religion", g.religion || "Not given"],
            ["Occupation", g.occupation],
            ["Employer", g.employerName],
            ["Work contact", g.workContact],
            ["Home address", g.homeAddress],
            ["Domicilium address", g.domiciliumAddress],
            ["Employer address", g.employerAddress],
          ]}
        />
      </CardContent>
    </Card>
  );
}

function GuardiansTab({ r }: { r: Registration }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <GuardianCard g={r.mother} title="Mother / guardian" r={r} />
      {r.father ? (
        <GuardianCard g={r.father} title="Father / guardian" r={r} />
      ) : (
        <Card className="flex items-center justify-center p-8 text-center text-sm text-muted-foreground">
          Single parent / guardian – no second guardian on this application.
        </Card>
      )}
    </div>
  );
}

function HealthTab({ r, full }: { r: Registration; full: boolean }) {
  const h = r.health;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Emergency contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {r.emergencyContacts.map((c, i) => (
                <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-cream px-4 py-3">
                  <div>
                    <p className="font-medium">
                      {c.name} {c.surname}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {c.relationship}
                      {c.workTel ? ` · work ${c.workTel}` : ""}
                    </p>
                  </div>
                  <a href={`tel:${c.cell.replace(/\s/g, "")}`} className={buttonVariants({ variant: "soft", size: "sm" })}>
                    <Phone aria-hidden /> {c.cell}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Collection by a third party</CardTitle>
            </CardHeader>
            <CardContent>
              {r.collector ? (
                <Dl
                  items={[
                    ["Name", r.collector.fullName],
                    ["Relationship", r.collector.relationship],
                    ["Tel", r.collector.tel],
                    ["Special notice", r.collector.specialNotice],
                  ]}
                />
              ) : (
                <p className="text-sm text-muted-foreground">Only parents / guardians may collect.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Safety essentials</CardTitle>
            </CardHeader>
            <CardContent>
              <Dl
                items={[
                  ["Allergies", h.allergies || "None noted"],
                  ["Emergency information", h.emergencyInfo || "None noted"],
                  ["Permission: family doctor", h.permissionFamilyDoctor === "yes" ? "Yes" : "No"],
                  ["Permission: nearest doctor", h.permissionNearestDoctor === "yes" ? "Yes" : "No"],
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {full ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Full health questionnaire</CardTitle>
            <Badge tone="purple">Admin only</Badge>
          </CardHeader>
          <CardContent>
            <Dl
              items={[
                ["Illnesses", h.illnesses.length ? h.illnesses.join(", ") : "None ticked"],
                ["Other illnesses", h.otherIllnesses],
                ["Medication", h.medication || "None"],
                ["Hearing / sight / speech", `${h.hearing || "—"} / ${h.sight || "—"} / ${h.speech || "—"}`],
                ["Toilet trained", { yes: "Yes", no: "No", learning: "Still learning", "not-yet-applicable": "Too young yet" }[h.toiletTrained]],
                ["Bed-wetting", h.bedWetting === "yes" ? "Yes" : "No"],
                ["Bedtime", h.bedtime],
                ["Signs of nervousness", h.nervousness],
                ["Referrals", h.referrals.length ? `${h.referrals.join(", ")}${h.referralReasons ? ` – ${h.referralReasons}` : ""}` : "None"],
                ["Conditions needing support", h.supportConditions],
                ["Other wellbeing info", h.otherWellbeing],
                ["Family doctor", `${h.doctorName}${h.doctorContact ? ` · ${h.doctorContact}` : ""}`],
                ["Medical aid", h.medicalAidName],
                ["Medical aid number", <Masked key="ma" value={h.medicalAidNumber} label="medical aid number" registrationId={r.id} />],
                ["Ambulance cover", h.ambulanceCover],
              ]}
            />
          </CardContent>
        </Card>
      ) : (
        <Restricted title="Full medical detail is restricted">
          Teachers see allergies, emergency information and contacts. The full health questionnaire, medical aid and
          doctor details are only visible to Admin users.
        </Restricted>
      )}
    </div>
  );
}

function DocumentsTab({
  r,
  canOpen,
  onRequest,
  missingCount,
}: {
  r: Registration;
  canOpen: boolean;
  onRequest: () => void;
  missingCount: number;
}) {
  const { actor } = useRole();
  const docs = documentProgress(r);
  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle>Documents checklist</CardTitle>
          <p className="text-sm text-muted-foreground">
            {docs.received} of {docs.total} received
          </p>
        </div>
        <Button variant="pink" size="sm" onClick={onRequest} disabled={missingCount === 0}>
          <Send aria-hidden /> Request missing documents
        </Button>
      </CardHeader>
      <CardContent>
        {!canOpen && (
          <p className="mb-4 rounded-xl bg-purple-soft px-3 py-2 text-sm text-purple-ink">
            You can see which documents are in, but only Admin users can open them.
          </p>
        )}
        <ul className="divide-y divide-border rounded-xl border border-border">
          {DOCUMENTS.map((d) => {
            const na = r.singleGuardian && d.who === "father";
            const st = r.documents[d.key];
            return (
              <li key={d.key} className={cn("flex flex-wrap items-center gap-3 px-4 py-3", na && "opacity-50")}>
                {st.received ? (
                  <CheckCircle2 className="size-5 shrink-0 text-green-ink" aria-label="Received" />
                ) : (
                  <Circle className="size-5 shrink-0 text-muted-foreground" aria-label="Missing" />
                )}
                <span className="flex-1">
                  {d.label}
                  {na && <span className="ml-2 text-xs">(not applicable)</span>}
                </span>
                {!na && st.received && canOpen && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => toast.info("Demo: in production this opens the file from private storage via a short-lived link.")}
                  >
                    View file
                  </Button>
                )}
                {!na && canOpen && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDocumentReceived(r.id, d.key, !st.received, actor)}
                  >
                    Mark as {st.received ? "missing" : "received"}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function NotesTab({ r }: { r: Registration }) {
  const { actor } = useRole();
  const [text, setText] = useState("");
  const save = async () => {
    if (!text.trim()) return;
    await addNote(r.id, text.trim(), actor);
    setText("");
    toast.success("Note added");
  };
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="note" className="text-sm font-medium">
              Add a note
            </label>
            <Textarea id="note" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Viewing went well, mom will send the birth certificate on Monday." />
            <Button onClick={save} disabled={!text.trim()} className="self-end" size="sm">
              Save note
            </Button>
          </div>
          <ul className="flex flex-col gap-3">
            {r.notes.length === 0 && <li className="text-sm text-muted-foreground">No notes yet.</li>}
            {r.notes.map((n) => (
              <li key={n.id} className="rounded-xl bg-cream px-4 py-3">
                <p className="text-sm">{n.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {n.author} · {formatDateTime(n.at)}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <ActivityIcon className="size-4 text-muted-foreground" aria-hidden />
          <CardTitle>Activity log</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="relative flex flex-col gap-4 border-l-2 border-border pl-5">
            {r.activity.map((a) => (
              <li key={a.id} className="relative">
                <span className="absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full bg-green" aria-hidden />
                <p className="text-sm">{a.text}</p>
                <p className="text-xs text-muted-foreground">
                  {a.actor} · {formatDateTime(a.at)}
                </p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
