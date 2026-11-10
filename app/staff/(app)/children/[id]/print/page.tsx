"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { AGE_GROUP_LABEL, CENTRE, DOCUMENTS, STATUS_LABEL } from "@/lib/constants";
import { getChild, getProgrammes, useData } from "@/lib/data";
import { useRole } from "@/lib/role";
import { ageGroupFor, calculateFees, childName, formatAge, formatDate, mask, rand } from "@/lib/utils";

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid rounded-lg border border-[#ccc] p-3">
      <h2 className="mb-1.5 font-sans text-[0.7rem] font-bold tracking-wider text-[#555] uppercase">{title}</h2>
      <div className="text-[0.8rem] leading-snug">{children}</div>
    </section>
  );
}

function KV({ k, v }: { k: string; v?: React.ReactNode }) {
  return (
    <p>
      <span className="text-[#666]">{k}: </span>
      {v || "—"}
    </p>
  );
}

export default function PrintSummary() {
  const { id } = useParams<{ id: string }>();
  const r = useData(() => getChild(id), [id]);
  const programmes = useData(getProgrammes) ?? [];
  const { can } = useRole();
  if (!r) return <div className="p-8 text-sm text-muted-foreground">{r === null ? "Not found" : "Loading…"}</div>;
  const prog = programmes.find((p) => p.id === r.programme);
  const fees = calculateFees(prog, r);
  const full = can("viewFullHealth");

  return (
    <main className="flex flex-col items-center gap-4 p-4 sm:p-8 print:p-0">
      <div className="no-print flex w-full max-w-[210mm] items-center justify-between">
        <Link href={`/staff/children/${r.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ArrowLeft aria-hidden /> Back to profile
        </Link>
        <Button onClick={() => window.print()}>
          <Printer aria-hidden /> Print
        </Button>
      </div>

      <article className="w-full max-w-[210mm] bg-white p-4 sm:p-[10mm] text-charcoal shadow-md print:max-w-none print:p-0 print:shadow-none">
        <header className="mb-4 flex flex-col gap-3 border-b-2 border-charcoal pb-3 sm:flex-row sm:items-start sm:justify-between print:flex-row print:items-start print:justify-between">
          <div className="text-[0.7rem]">
            <Logo />
          </div>
          <div className="text-[0.7rem] leading-snug text-[#555] sm:text-right print:text-right">
            <p className="font-semibold text-charcoal">{CENTRE.name}</p>
            {CENTRE.sites.map((s) => (
              <p key={s.id}>
                {s.name}: {s.address} · {s.tel}
              </p>
            ))}
            <p>{CENTRE.email}</p>
          </div>
        </header>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between print:flex-row print:items-end print:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{childName(r)}</h1>
            <p className="text-sm text-[#555]">
              {formatAge(r.child.dateOfBirth)} · {AGE_GROUP_LABEL[ageGroupFor(r.child.dateOfBirth, r.programme)]} · {prog?.name}
            </p>
          </div>
          <div className="text-sm sm:text-right print:text-right">
            <p className="font-mono font-semibold">{r.registrationNumber}</p>
            <p>Status: {STATUS_LABEL[r.status]}</p>
            <p>Admission: {formatDate(r.admissionDate)}</p>
          </div>
        </div>

        {r.health.emergencyInfo && (
          <p className="mb-3 rounded border-2 border-red-ink px-3 py-1.5 text-sm font-bold text-red-ink">⚠ {r.health.emergencyInfo}</p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 print:grid-cols-2">
          <Box title="Child">
            <KV k="Date of birth" v={formatDate(r.child.dateOfBirth)} />
            <KV k="Home language" v={r.child.homeLanguage} />
            <KV k="Primary caregiver" v={r.child.primaryCaregiver} />
            <KV k="Address" v={r.child.homeAddress} />
          </Box>
          <Box title="Programme and fees">
            <KV k="Programme" v={`${prog?.name} (${prog?.hours})`} />
            <KV k="Monthly" v={`${rand(fees.monthlyTotal)}${r.siblingDiscount ? " incl. 10% sibling discount" : ""}`} />
            <KV k="Swimming" v={r.swimming ? "Yes, R750 per term" : "No"} />
          </Box>
          <Box title="Mother / guardian">
            <KV k="Name" v={r.mother.fullName} />
            <KV k="Cell" v={r.mother.cell} />
            <KV k="Email" v={r.mother.email} />
            <KV k="Work" v={r.mother.workContact} />
          </Box>
          <Box title="Father / guardian">
            {r.father ? (
              <>
                <KV k="Name" v={r.father.fullName} />
                <KV k="Cell" v={r.father.cell} />
                <KV k="Email" v={r.father.email} />
                <KV k="Work" v={r.father.workContact} />
              </>
            ) : (
              <p>Single parent / guardian</p>
            )}
          </Box>
          <Box title="Emergency contacts">
            {r.emergencyContacts.map((c, i) => (
              <p key={i}>
                {i + 1}. {c.name} {c.surname} ({c.relationship}) – {c.cell}
              </p>
            ))}
          </Box>
          <Box title="Collection permission">
            {r.collector ? (
              <>
                <KV k="Name" v={r.collector.fullName} />
                <KV k="Relationship" v={r.collector.relationship} />
                <KV k="Tel" v={r.collector.tel} />
                <KV k="Notice" v={r.collector.specialNotice} />
              </>
            ) : (
              <p>Parents / guardians only</p>
            )}
          </Box>
          <Box title="Health essentials">
            <KV k="Allergies" v={r.health.allergies || "None noted"} />
            <KV k="Medication" v={full ? r.health.medication || "None" : "Restricted"} />
            <KV k="Doctor" v={full ? `${r.health.doctorName} ${r.health.doctorContact}` : "Restricted"} />
            <KV k="Medical aid" v={full ? `${r.health.medicalAidName} ${mask(r.health.medicalAidNumber)}` : "Restricted"} />
            <KV k="Emergency permission" v={`Family doctor: ${r.health.permissionFamilyDoctor} · Nearest: ${r.health.permissionNearestDoctor}`} />
          </Box>
          <Box title="Documents">
            <ul className="columns-1">
              {DOCUMENTS.filter((d) => !(r.singleGuardian && d.who === "father")).map((d) => (
                <li key={d.key}>
                  {r.documents[d.key].received ? "☑" : "☐"} {d.label}
                </li>
              ))}
            </ul>
          </Box>
        </div>

        <footer className="mt-4 flex flex-col gap-1 sm:flex-row sm:justify-between border-t border-[#ccc] pt-2 text-[0.65rem] text-[#777]">
          <span>Confidential – contains personal information (POPIA). Printed {new Date().toLocaleDateString("en-ZA")}.</span>
          <span>Concept demo – sample data only</span>
        </footer>
      </article>
    </main>
  );
}
