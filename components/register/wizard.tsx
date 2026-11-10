"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Save, Send } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { createRegistration, getProgrammes, useData } from "@/lib/data";
import type { DocumentKey, Registration, RegistrationInput } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Confirmation } from "./confirmation";
import { STEPS, STEP_SCHEMAS, defaultValues, type FormValues } from "./schema";
import {
  ChildStep,
  DocumentsStep,
  EmergencyStep,
  FatherStep,
  HealthStep,
  MotherStep,
  ProgrammeStep,
  ReviewStep,
} from "./steps";

const DRAFT_KEY = "lil-angels-demo:draft";

function toInput(v: FormValues): RegistrationInput {
  const today = new Date().toISOString().slice(0, 10);
  const guardian = (g: FormValues["mother"]) => ({ ...g, religion: g.religion || undefined });
  return {
    programme: v.programme as RegistrationInput["programme"],
    swimming: v.swimming,
    siblingDiscount: v.siblingDiscount,
    mother: guardian(v.mother),
    singleGuardian: v.singleGuardian,
    father: v.singleGuardian ? null : guardian(v.father),
    child: {
      ...v.child,
      householdChildren: Number(v.child.householdChildren) || 1,
      biologicalParents: v.child.biologicalParents === "no" ? "no" : "yes",
      previousCentres: v.child.previousCentres.filter((c) => c.name.trim()),
    },
    health: {
      ...v.health,
      illnesses: v.health.illnesses || [],
      referrals: v.health.referrals || [],
      toiletTrained: v.health.toiletTrained || "not-yet-applicable",
      bedWetting: v.health.bedWetting === "yes" ? "yes" : "no",
      permissionFamilyDoctor: v.health.permissionFamilyDoctor === "yes" ? "yes" : "no",
      permissionNearestDoctor: v.health.permissionNearestDoctor === "yes" ? "yes" : "no",
    },
    emergencyContacts: v.emergencyContacts,
    collector: v.collectorEnabled ? v.collector : null,
    documents: Object.fromEntries(
      (Object.keys(v.documents) as DocumentKey[]).map((k) => [
        k,
        v.documents[k] ? { received: true, fileName: v.documents[k] } : { received: false },
      ]),
    ) as RegistrationInput["documents"],
    declaration: {
      mother: { name: v.motherSignature, date: today, place: v.motherPlace },
      father: v.singleGuardian ? null : { name: v.fatherSignature, date: today, place: v.fatherPlace },
    },
    consent: { privacyNoticeAccepted: v.privacyAccepted, acceptedAt: new Date().toISOString() },
  };
}

export function RegistrationWizard() {
  const programmes = useData(getProgrammes) ?? [];
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [resumed, setResumed] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [submitted, setSubmitted] = useState<Registration | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const stepRef = useRef(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const loaded = useRef(false);

  // Validate only the current step's schema.
  const resolver: Resolver<FormValues> = (values, ctx, opts) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    zodResolver(STEP_SCHEMAS[stepRef.current] as any, undefined, { raw: true })(values, ctx, opts as any) as any;

  const methods = useForm<FormValues>({ defaultValues: defaultValues(), resolver, mode: "onTouched" });
  const { handleSubmit, trigger, reset, watch, getValues } = methods;

  // Restore a saved draft ("save and continue later").
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as { values: FormValues; step: number; maxStep: number };
        const hasAnswers = d.step > 0 || JSON.stringify(d.values) !== JSON.stringify(defaultValues());
        if (!hasAnswers) throw new Error("empty draft");
        reset({ ...defaultValues(), ...d.values });
        stepRef.current = d.step;
        setStep(d.step);
        setMaxStep(d.maxStep);
        setResumed(true);
      }
    } catch {
      /* ignore broken drafts */
    }
    loaded.current = true;
  }, [reset]);

  // Autosave every change on this device.
  useEffect(() => {
    const sub = watch((values) => {
      if (!loaded.current) return;
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ values, step: stepRef.current, maxStep }));
    });
    return () => sub.unsubscribe();
  }, [watch, maxStep]);

  const saveDraft = () =>
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ values: getValues(), step: stepRef.current, maxStep }));

  const goTo = (n: number) => {
    stepRef.current = n;
    setStep(n);
    setMaxStep((m) => Math.max(m, n));
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => headingRef.current?.focus(), 50);
  };

  useEffect(() => {
    if (loaded.current && step > 0) saveDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const next = async () => {
    const ok = await trigger();
    if (!ok) {
      toast.error("A few answers need your attention.");
      setTimeout(() => (document.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus(), 30);
      return;
    }
    goTo(step + 1);
  };

  const onSubmit = handleSubmit(
    async () => {
      setSubmitting(true);
      const reg = await createRegistration(toInput(getValues()));
      localStorage.removeItem(DRAFT_KEY);
      setSubmitting(false);
      setSubmitted(reg);
      window.scrollTo({ top: 0 });
    },
    () => {
      toast.error("A few answers need your attention.");
      setTimeout(() => (document.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus(), 30);
    },
  );

  const startOver = () => {
    localStorage.removeItem(DRAFT_KEY);
    reset(defaultValues());
    setResumed(false);
    setMaxStep(0);
    goTo(0);
  };

  if (submitted) return <Confirmation registration={submitted} programmes={programmes} />;

  const s = STEPS[step];
  const pct = ((step + 1) / STEPS.length) * 100;
  const isLast = step === STEPS.length - 1;

  return (
    <FormProvider {...methods}>
      <header className="border-b border-border bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" aria-label="Lil Angels home" className="text-[0.8rem]">
            <Logo compact />
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              saveDraft();
              setSavedOpen(true);
            }}
          >
            <Save aria-hidden /> <span className="hidden sm:inline">Save and continue later</span>
            <span className="sm:hidden">Save</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-32 pt-6 sm:pt-8">
        {resumed && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-green-soft px-4 py-3 text-sm text-green-ink">
            <span>
              <strong>Welcome back!</strong> We kept your answers – carry on where you left off.
            </span>
            <Button variant="link" size="sm" onClick={startOver}>
              Start over
            </Button>
          </div>
        )}

        <div className="mb-6 flex flex-col gap-3">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold text-pink-ink">
              Step {step + 1} of {STEPS.length}
            </span>
            <span className="text-muted-foreground">{Math.round(pct)}% done</span>
          </div>
          <Progress value={pct} label={`Registration progress: step ${step + 1} of ${STEPS.length}`} />
          <ol className="hidden gap-1 md:flex" aria-label="Steps">
            {STEPS.map((st, i) => {
              const reachable = i <= maxStep;
              return (
                <li key={st.id} className="flex-1">
                  <button
                    type="button"
                    disabled={!reachable}
                    onClick={() => reachable && (i < step ? goTo(i) : i > step && next())}
                    aria-current={i === step ? "step" : undefined}
                    className={cn(
                      "flex w-full items-center gap-1.5 rounded-lg px-1.5 py-1 text-left text-[0.7rem] leading-tight transition-colors",
                      i === step ? "font-semibold text-foreground" : reachable ? "text-muted-foreground hover:text-foreground cursor-pointer" : "text-muted-foreground/50",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[0.65rem]",
                        i < step ? "bg-green-ink text-white" : i === step ? "bg-pink-ink text-white" : "bg-muted",
                      )}
                    >
                      {i < step ? <Check className="size-3" aria-hidden /> : i + 1}
                    </span>
                    {st.title}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <h1 ref={headingRef} tabIndex={-1} className="mb-5 text-3xl font-semibold text-green-ink focus:outline-none sm:text-4xl">
          {s.heading}
        </h1>

        <form onSubmit={(e) => e.preventDefault()} noValidate>
          {step === 0 && <ProgrammeStep programmes={programmes} />}
          {step === 1 && <MotherStep />}
          {step === 2 && <FatherStep />}
          {step === 3 && <ChildStep />}
          {step === 4 && <HealthStep />}
          {step === 5 && <EmergencyStep />}
          {step === 6 && <DocumentsStep />}
          {step === 7 && <ReviewStep programmes={programmes} goTo={goTo} />}
        </form>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <Button variant="ghost" onClick={() => goTo(step - 1)} disabled={step === 0}>
            <ArrowLeft aria-hidden /> Back
          </Button>
          {isLast ? (
            <Button variant="pink" size="lg" onClick={onSubmit} disabled={submitting}>
              {submitting ? (
                "Sending…"
              ) : (
                <>
                  <span className="min-[380px]:hidden">Submit</span>
                  <span className="hidden min-[380px]:inline">Submit application</span>
                </>
              )}{" "}
              <Send aria-hidden />
            </Button>
          ) : (
            <Button size="lg" onClick={next}>
              Continue <ArrowRight aria-hidden />
            </Button>
          )}
        </div>
      </div>

      <Dialog open={savedOpen} onClose={() => setSavedOpen(false)} title="Your answers are saved">
        <p className="text-sm text-muted-foreground">
          We&apos;ve saved your progress on this device. Come back to this page any time and you&apos;ll carry on from{" "}
          <strong>step {step + 1}</strong>.
        </p>
        <p className="mt-3 rounded-xl bg-blue-soft px-3 py-2 text-xs text-blue-ink">
          In the live version we&apos;d also email you a secure link so you can finish on another device.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Link href="/" className="inline-flex h-11 items-center rounded-full px-5 text-sm font-medium hover:bg-muted">
            Leave for now
          </Link>
          <Button onClick={() => setSavedOpen(false)}>Keep going</Button>
        </div>
      </Dialog>
    </FormProvider>
  );
}
