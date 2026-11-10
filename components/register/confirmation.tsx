"use client";
import Link from "next/link";
import { CalendarClock, CreditCard, FileCheck2, LayoutDashboard, PartyPopper } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { APPLICATION_FEE, CENTRE } from "@/lib/constants";
import type { Programme, Registration } from "@/lib/types";
import { calculateFees, cn, documentProgress, rand, requiredDocuments } from "@/lib/utils";

export function Confirmation({ registration: r, programmes }: { registration: Registration; programmes: Programme[] }) {
  const prog = programmes.find((p) => p.id === r.programme);
  const fees = calculateFees(prog, r);
  const docs = documentProgress(r);
  const missing = requiredDocuments(r).filter((d) => !r.documents[d.key].received);
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <Link href="/" aria-label="Lil Angels home" className="self-center text-[0.9rem]">
        <Logo />
      </Link>
      <section className="flex flex-col items-center gap-3 rounded-3xl border-2 border-green/50 bg-white p-8 text-center" aria-live="polite">
        <span className="inline-flex size-16 items-center justify-center rounded-full bg-pink-soft text-pink-ink">
          <PartyPopper className="size-8" aria-hidden />
        </span>
        <h1 className="text-3xl font-semibold text-green-ink">Thank you, we&apos;ve got it!</h1>
        <p className="text-muted-foreground">
          {r.child.fullName}&apos;s application has been sent to Lil Angels. In the live system a copy is emailed to {r.mother.email}.
        </p>
        <div className="mt-2 rounded-2xl bg-cream px-6 py-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Your registration number</p>
          <p className="font-display text-3xl font-semibold tracking-wide">{r.registrationNumber}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {prog?.name} · {rand(fees.monthlyTotal)} per month{r.siblingDiscount ? " (with sibling discount)" : ""}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">What happens next</h2>
        <ol className="flex flex-col gap-3">
          <li className="flex gap-3 rounded-2xl bg-white p-4">
            <CreditCard className="mt-0.5 size-5 shrink-0 text-orange-ink" aria-hidden />
            <div>
              <p className="font-medium">Pay the {rand(APPLICATION_FEE)} application fee</p>
              <p className="text-sm text-muted-foreground">
                Use <strong>{r.registrationNumber}</strong> as your payment reference. Banking details are on our website.
              </p>
            </div>
          </li>
          <li className="flex gap-3 rounded-2xl bg-white p-4">
            <FileCheck2 className="mt-0.5 size-5 shrink-0 text-blue-ink" aria-hidden />
            <div>
              <p className="font-medium">
                Documents: {docs.received} of {docs.total} received
              </p>
              {missing.length > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Still needed: {missing.map((m) => m.label.replace(/^(Mother|Father) \/ guardian's /, "$1's ")).join(", ")}.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">All done – thank you!</p>
              )}
            </div>
          </li>
          <li className="flex gap-3 rounded-2xl bg-white p-4">
            <CalendarClock className="mt-0.5 size-5 shrink-0 text-green-ink" aria-hidden />
            <div>
              <p className="font-medium">We&apos;ll be in touch</p>
              <p className="text-sm text-muted-foreground">
                Our office will contact you about a viewing and available spaces. Viewings are between 08:30 and 11:30.
                Questions? Call {CENTRE.sites[0].tel} or email {CENTRE.email}.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <div className="flex flex-wrap justify-center gap-3 rounded-2xl border-2 border-dashed border-blue/50 p-4 text-sm">
        <span className="w-full text-center text-blue-ink">Demo tip: see this application arrive on the staff side.</span>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Back to start
        </Link>
        <Link href={`/staff/children/${r.id}`} className={cn(buttonVariants())}>
          <LayoutDashboard aria-hidden /> Open in staff dashboard
        </Link>
      </div>
    </main>
  );
}
