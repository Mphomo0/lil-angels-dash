"use client";
import { useFieldArray, useFormContext, useWatch, type FieldError } from "react-hook-form";
import {
  CheckCircle2,
  FileUp,
  Info,
  Lock,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Waves,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Choice, Field, Fieldset } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import {
  APPLICATION_FEE,
  CENTRE,
  DOCUMENTS,
  ILLNESSES,
  MARITAL_STATUSES,
  REFERRALS,
  SWIMMING,
} from "@/lib/constants";
import type { Programme } from "@/lib/types";
import { calculateFees, cn, rand } from "@/lib/utils";
import { STEPS, emptyContact, type FormValues } from "./schema";

type Errs = Record<string, FieldError | undefined>;

function useErrors() {
  const {
    formState: { errors },
  } = useFormContext<FormValues>();
  return errors;
}

function Section({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 sm:p-6", className)}>
      {title && <h3 className="text-base font-semibold">{title}</h3>}
      {children}
    </section>
  );
}

function Note({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "orange" | "green" }) {
  const tones = {
    blue: "bg-blue-soft text-blue-ink",
    orange: "bg-orange-soft text-orange-ink",
    green: "bg-green-soft text-green-ink",
  };
  return (
    <p className={cn("flex gap-2 rounded-xl px-4 py-3 text-sm", tones[tone])}>
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

// ================================================================ 1 Programme

export function ProgrammeStep({ programmes }: { programmes: Programme[] }) {
  const { register, control } = useFormContext<FormValues>();
  const errors = useErrors();
  const [programmeId, swimming, siblingDiscount] = useWatch({
    control,
    name: ["programme", "swimming", "siblingDiscount"],
  });
  const selected = programmes.find((p) => p.id === programmeId);
  const fees = calculateFees(selected, { swimming, siblingDiscount });

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
      <div className="flex flex-col gap-5">
        <Fieldset legend="Choose one programme" error={errors.programme?.message} hint="All programmes run Monday to Friday, excluding public holidays.">
          <div className="grid gap-3">
            {programmes.map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer gap-3 rounded-2xl border-2 border-border bg-white p-4 transition-colors hover:border-green has-[:checked]:border-green-ink has-[:checked]:bg-green-soft has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-blue-soft"
              >
                <input type="radio" value={p.id} {...register("programme")} className="mt-1 size-5 shrink-0 accent-[var(--brand-green-ink)]" />
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="font-display text-lg font-semibold">{p.name}</span>
                    <span className="font-display text-lg font-semibold text-green-ink">
                      {rand(p.pricePerMonth)}
                      <span className="text-sm font-normal text-muted-foreground"> /month</span>
                    </span>
                  </span>
                  <span className="text-sm font-medium">{p.hours}</span>
                  {p.extraHours && <span className="text-sm">{p.extraHours}</span>}
                  <span className="text-sm text-muted-foreground">{p.inclusions}</span>
                </span>
              </label>
            ))}
          </div>
        </Fieldset>

        <Fieldset legend="Optional extras">
          <Choice
            type="checkbox"
            {...register("swimming")}
            label={
              <span className="inline-flex items-center gap-2">
                <Waves className="size-4 text-blue-ink" aria-hidden /> Add swimming lessons – {rand(SWIMMING.pricePerTerm)} per term
              </span>
            }
            description={SWIMMING.description}
          />
          <Choice
            type="checkbox"
            {...register("siblingDiscount")}
            label="I'm registering 2 or more children from the same household"
            description="A 10% discount applies to all children from the same household."
          />
        </Fieldset>
      </div>

      <aside aria-live="polite" className="h-fit rounded-2xl border-2 border-green/50 bg-white p-5 lg:sticky lg:top-24">
        <h3 className="text-base font-semibold">Your monthly total</h3>
        {selected ? (
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt>{selected.name}</dt>
              <dd>{rand(fees.monthly)}</dd>
            </div>
            {siblingDiscount && (
              <div className="flex justify-between text-green-ink">
                <dt>Sibling discount (10%)</dt>
                <dd>−{rand(fees.discount)}</dd>
              </div>
            )}
            <div className="mt-1 flex justify-between border-t border-border pt-3 font-display text-2xl font-semibold">
              <dt>Per month</dt>
              <dd>{rand(fees.monthlyTotal)}</dd>
            </div>
            {swimming && (
              <div className="flex justify-between text-blue-ink">
                <dt>Swimming (per term)</dt>
                <dd>{rand(SWIMMING.pricePerTerm)}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Choose a programme to see your total.</p>
        )}
        <p className="mt-4 rounded-xl bg-orange-soft px-3 py-2 text-xs text-orange-ink">
          A once-off, non-refundable application fee of <strong>{rand(APPLICATION_FEE)}</strong> is paid when you apply.
        </p>
      </aside>
    </div>
  );
}

// ================================================================ 2/3 Guardian

function GuardianFields({ who }: { who: "mother" | "father" }) {
  const { register, setValue, getValues } = useFormContext<FormValues>();
  const errors = (useErrors()[who] ?? {}) as Errs;
  const id = (k: string) => `${who}-${k}`;
  return (
    <>
      <Section title="Personal details">
        <Field id={id("fullName")} label="Name and surname" error={errors.fullName?.message}>
          <Input autoComplete="name" {...register(`${who}.fullName`)} />
        </Field>
        <Field id={id("idNumber")} label="ID or passport number" error={errors.idNumber?.message} hint="We keep this private and only show it to the office administrator.">
          <Input inputMode="text" autoComplete="off" {...register(`${who}.idNumber`)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={id("cell")} label="Cell number" error={errors.cell?.message}>
            <Input type="tel" inputMode="tel" autoComplete="tel" placeholder="e.g. 080 000 1234" {...register(`${who}.cell`)} />
          </Field>
          <Field id={id("email")} label="Email address" error={errors.email?.message}>
            <Input type="email" autoComplete="email" {...register(`${who}.email`)} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={id("maritalStatus")} label="Marital status" error={errors.maritalStatus?.message}>
            <Select {...register(`${who}.maritalStatus`)}>
              <option value="">Please choose…</option>
              {MARITAL_STATUSES.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </Select>
          </Field>
          <Field id={id("religion")} label="Religion" optional hint="You don't have to answer this.">
            <Input {...register(`${who}.religion`)} />
          </Field>
        </div>
      </Section>

      <Section title="Address">
        <Field id={id("homeAddress")} label="Home address" error={errors.homeAddress?.message}>
          <Textarea rows={2} autoComplete="street-address" className="min-h-16" {...register(`${who}.homeAddress`)} />
        </Field>
        <Field
          id={id("domiciliumAddress")}
          label="Address for legal notices"
          hint={<><em>Domicilium citandi et executandi</em> – the address where official letters may be delivered. Usually your home address.</>}
          error={errors.domiciliumAddress?.message}
        >
          <Textarea rows={2} className="min-h-16" {...register(`${who}.domiciliumAddress`)} />
        </Field>
        <Button
          variant="soft"
          size="sm"
          className="self-start"
          onClick={() => setValue(`${who}.domiciliumAddress`, getValues(`${who}.homeAddress`), { shouldValidate: true })}
        >
          Same as home address
        </Button>
      </Section>

      <Section title="Work">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={id("occupation")} label="Occupation" optional>
            <Input autoComplete="organization-title" {...register(`${who}.occupation`)} />
          </Field>
          <Field id={id("employerName")} label="Employer's name" optional>
            <Input autoComplete="organization" {...register(`${who}.employerName`)} />
          </Field>
        </div>
        <Field id={id("employerAddress")} label="Employer's address" optional>
          <Input {...register(`${who}.employerAddress`)} />
        </Field>
        <Field id={id("workContact")} label="Work contact number" optional error={errors.workContact?.message}>
          <Input type="tel" inputMode="tel" {...register(`${who}.workContact`)} />
        </Field>
      </Section>
      <Note>Please remember a copy of the ID document and proof of residence – you can add these at the Documents step.</Note>
    </>
  );
}

export function MotherStep() {
  return (
    <div className="flex flex-col gap-5">
      <GuardianFields who="mother" />
    </div>
  );
}

export function FatherStep() {
  const { register, control } = useFormContext<FormValues>();
  const single = useWatch({ control, name: "singleGuardian" });
  return (
    <div className="flex flex-col gap-5">
      <Choice
        type="checkbox"
        {...register("singleGuardian")}
        label="I'm the only parent or guardian – skip this step"
        description="That's completely fine. Tick this and press Continue."
        className="border-dashed"
      />
      {single ? (
        <Note tone="green">No problem – we&apos;ll skip the second guardian and their documents.</Note>
      ) : (
        <GuardianFields who="father" />
      )}
    </div>
  );
}

// ================================================================ 4 Child

export function ChildStep() {
  const { register, setValue, getValues } = useFormContext<FormValues>();
  const errors = (useErrors().child ?? {}) as Errs;
  return (
    <div className="flex flex-col gap-5">
      <Section title="Your child">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="child-fullName" label="Full name(s)" error={errors.fullName?.message}>
            <Input autoComplete="off" {...register("child.fullName")} />
          </Field>
          <Field id="child-surname" label="Surname" error={errors.surname?.message}>
            <Input autoComplete="off" {...register("child.surname")} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="child-dob" label="Date of birth" error={errors.dateOfBirth?.message}>
            <Input type="date" max={new Date().toISOString().slice(0, 10)} {...register("child.dateOfBirth")} />
          </Field>
          <Field id="child-lang" label="Home language" error={errors.homeLanguage?.message}>
            <Input list="languages" {...register("child.homeLanguage")} />
          </Field>
          <datalist id="languages">
            {["English", "Afrikaans", "isiXhosa", "isiZulu", "Sesotho", "Setswana", "Portuguese", "French"].map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
        </div>
      </Section>

      <Section title="Home">
        <Field id="child-address" label="Home address" error={errors.homeAddress?.message}>
          <Textarea rows={2} className="min-h-16" {...register("child.homeAddress")} />
        </Field>
        <Button
          variant="soft"
          size="sm"
          className="self-start"
          onClick={() => setValue("child.homeAddress", getValues("mother.homeAddress"), { shouldValidate: true })}
        >
          Same as mother / guardian
        </Button>
        <Field id="child-phone" label="Home phone number" optional error={errors.homePhone?.message}>
          <Input type="tel" inputMode="tel" {...register("child.homePhone")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="child-household" label="Number of children in the household" error={errors.householdChildren?.message}>
            <Input type="number" min={1} max={15} inputMode="numeric" {...register("child.householdChildren")} />
          </Field>
          <Field id="child-ages" label="Their ages" optional hint="e.g. 2, 5 and 8">
            <Input {...register("child.householdAges")} />
          </Field>
        </div>
        <Field id="child-caregiver" label="Name of primary caregiver" hint="The person who looks after your child most of the time." error={errors.primaryCaregiver?.message}>
          <Input {...register("child.primaryCaregiver")} />
        </Field>
        <Fieldset legend="Are you the biological parents of the child?" error={errors.biologicalParents?.message}>
          <div className="grid grid-cols-2 gap-3">
            <Choice value="yes" label="Yes" {...register("child.biologicalParents")} />
            <Choice value="no" label="No" {...register("child.biologicalParents")} />
          </div>
        </Fieldset>
      </Section>

      <Section title="Previous daycare centres (if any)">
        {[0, 1].map((i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-3">
            <Field id={`prev-${i}-name`} label={`Centre ${i + 1} name`} optional>
              <Input {...register(`child.previousCentres.${i}.name`)} />
            </Field>
            <Field id={`prev-${i}-city`} label="City" optional>
              <Input {...register(`child.previousCentres.${i}.city`)} />
            </Field>
            <Field id={`prev-${i}-tel`} label="Tel" optional>
              <Input type="tel" inputMode="tel" {...register(`child.previousCentres.${i}.tel`)} />
            </Field>
          </div>
        ))}
      </Section>
      <Note>Please remember a copy of your child&apos;s birth certificate – you can add it at the Documents step.</Note>
    </div>
  );
}

// ================================================================ 5 Health

export function HealthStep() {
  const { register } = useFormContext<FormValues>();
  const errors = (useErrors().health ?? {}) as Errs;
  return (
    <div className="flex flex-col gap-5">
      <p className="flex gap-2 rounded-xl bg-purple-soft px-4 py-3 text-sm text-purple-ink">
        <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          Health information is private. Only the principal and office administrator can see the full details. Teachers
          only see what they need to keep your child safe, like allergies and emergency information.
        </span>
      </p>

      <Section title="Illnesses">
        <Fieldset legend="Has your child had, or do they have, any of these?" hint="Tick all that apply. Leave blank if none.">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ILLNESSES.map((ill) => (
              <Choice key={ill} type="checkbox" value={ill} label={ill} {...register("health.illnesses")} className="py-2.5" />
            ))}
          </div>
        </Fieldset>
        <Field id="h-other" label="Any other illnesses not mentioned" optional>
          <Input {...register("health.otherIllnesses")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="h-med" label="Is your child on any medication?" optional hint="Leave blank if not.">
            <Input {...register("health.medication")} />
          </Field>
          <Field id="h-allergies" label="Does your child have any allergies?" optional hint="e.g. peanuts, bee stings">
            <Input {...register("health.allergies")} />
          </Field>
        </div>
      </Section>

      <Section title="Development and routine">
        <p className="text-sm font-medium">Does your child have any problems with…</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field id="h-hearing" label="Hearing" optional>
            <Input placeholder="No" {...register("health.hearing")} />
          </Field>
          <Field id="h-sight" label="Sight" optional>
            <Input placeholder="No" {...register("health.sight")} />
          </Field>
          <Field id="h-speech" label="Speech" optional>
            <Input placeholder="No" {...register("health.speech")} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="h-toilet" label="Is your child toilet trained?" hint="Usually between 2 and 3 years." optional>
            <Select {...register("health.toiletTrained")}>
              <option value="">Please choose…</option>
              <option value="yes">Yes</option>
              <option value="learning">Still learning</option>
              <option value="no">No</option>
              <option value="not-yet-applicable">Too young yet</option>
            </Select>
          </Field>
          <Field id="h-bed" label="Does your child wet the bed regularly?" optional>
            <Select {...register("health.bedWetting")}>
              <option value="">Please choose…</option>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Select>
          </Field>
          <Field id="h-bedtime" label="What time does your child go to bed?" optional>
            <Input type="time" {...register("health.bedtime")} />
          </Field>
          <Field id="h-nerves" label="Any signs of nervousness?" optional>
            <Input {...register("health.nervousness")} />
          </Field>
        </div>
        <Fieldset legend="Has your child ever been referred to a…" hint="Tick any that apply.">
          <div className="grid gap-2 sm:grid-cols-3">
            {REFERRALS.map((r) => (
              <Choice key={r} type="checkbox" value={r} label={r} {...register("health.referrals")} className="py-2.5" />
            ))}
          </div>
        </Fieldset>
        <Field id="h-reasons" label="If yes, please tell us why" optional>
          <Textarea rows={2} className="min-h-16" {...register("health.referralReasons")} />
        </Field>
        <Field id="h-support" label="Does your child have any health conditions that need support from us?" optional>
          <Textarea rows={2} className="min-h-16" {...register("health.supportConditions")} />
        </Field>
        <Field id="h-wellbeing" label="Anything else about your child's wellbeing you'd like us to know?" optional>
          <Textarea rows={3} {...register("health.otherWellbeing")} />
        </Field>
      </Section>

      <Section title="Doctor and medical aid">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="h-doc" label="Family doctor's name" optional>
            <Input {...register("health.doctorName")} />
          </Field>
          <Field id="h-doc-tel" label="Doctor's contact number" optional>
            <Input type="tel" inputMode="tel" {...register("health.doctorContact")} />
          </Field>
          <Field id="h-aid" label="Medical aid name" optional>
            <Input {...register("health.medicalAidName")} />
          </Field>
          <Field id="h-aid-no" label="Medical aid number" optional>
            <Input autoComplete="off" {...register("health.medicalAidNumber")} />
          </Field>
        </div>
        <Fieldset
          legend="May we take your child to the doctor above in an emergency?"
          error={errors.permissionFamilyDoctor?.message}
        >
          <div className="grid grid-cols-2 gap-3">
            <Choice value="yes" label="Yes" {...register("health.permissionFamilyDoctor")} />
            <Choice value="no" label="No" {...register("health.permissionFamilyDoctor")} />
          </div>
        </Fieldset>
        <Fieldset
          legend="If your doctor isn't available, may we go to the closest doctor or medical centre?"
          error={errors.permissionNearestDoctor?.message}
        >
          <div className="grid grid-cols-2 gap-3">
            <Choice value="yes" label="Yes" {...register("health.permissionNearestDoctor")} />
            <Choice value="no" label="No" {...register("health.permissionNearestDoctor")} />
          </div>
        </Fieldset>
        <Field id="h-amb" label="Do you have ambulance cover?" optional hint="If an ambulance is needed, parents are responsible for the cost.">
          <Input placeholder="e.g. Yes, through my medical aid" {...register("health.ambulanceCover")} />
        </Field>
        <Field
          id="h-essential"
          label="Anything we must know in an emergency?"
          optional
          hint="e.g. allergic to penicillin. Teachers will see this."
        >
          <Input {...register("health.emergencyInfo")} />
        </Field>
      </Section>
      <Note>Please let us know as soon as possible if anything about your child&apos;s health changes.</Note>
    </div>
  );
}

// ================================================================ 6 Emergency

export function EmergencyStep() {
  const { register, control } = useFormContext<FormValues>();
  const errors = useErrors();
  const { fields, append, remove } = useFieldArray({ control, name: "emergencyContacts" });
  const collectorEnabled = useWatch({ control, name: "collectorEnabled" });
  const cErr = (errors.collector ?? {}) as Errs;
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        Who can we call if we can&apos;t reach you? Add up to four people.
      </p>
      {fields.map((f, i) => {
        const e = (errors.emergencyContacts?.[i] ?? {}) as Errs;
        return (
          <Section key={f.id} className="relative">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Contact {i + 1}</h3>
              {fields.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => remove(i)} aria-label={`Remove contact ${i + 1}`}>
                  <Trash2 aria-hidden /> Remove
                </Button>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id={`ec-${i}-name`} label="Name" error={e.name?.message}>
                <Input {...register(`emergencyContacts.${i}.name`)} />
              </Field>
              <Field id={`ec-${i}-surname`} label="Surname" error={e.surname?.message}>
                <Input {...register(`emergencyContacts.${i}.surname`)} />
              </Field>
              <Field id={`ec-${i}-rel`} label="Relationship to your child" error={e.relationship?.message}>
                <Input placeholder="e.g. Grandmother" {...register(`emergencyContacts.${i}.relationship`)} />
              </Field>
              <Field id={`ec-${i}-cell`} label="Cell number" error={e.cell?.message}>
                <Input type="tel" inputMode="tel" {...register(`emergencyContacts.${i}.cell`)} />
              </Field>
              <Field id={`ec-${i}-work`} label="Work telephone" optional error={e.workTel?.message}>
                <Input type="tel" inputMode="tel" {...register(`emergencyContacts.${i}.workTel`)} />
              </Field>
            </div>
          </Section>
        );
      })}
      {errors.emergencyContacts?.root?.message && (
        <p className="text-sm font-medium text-red-ink">{errors.emergencyContacts.root.message}</p>
      )}
      {fields.length < 4 && (
        <Button variant="outline" className="self-start" onClick={() => append(emptyContact())}>
          <Plus aria-hidden /> Add another contact
        </Button>
      )}

      <Section title="Collection by someone else">
        <Choice
          type="checkbox"
          {...register("collectorEnabled")}
          label="I give permission for someone else to collect my child"
          description="For example a grandparent, au pair or friend."
        />
        {collectorEnabled && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="col-name" label="Name and surname" error={cErr.fullName?.message}>
              <Input {...register("collector.fullName")} />
            </Field>
            <Field id="col-rel" label="Relationship to your child" error={cErr.relationship?.message}>
              <Input {...register("collector.relationship")} />
            </Field>
            <Field id="col-tel" label="Phone number" error={cErr.tel?.message}>
              <Input type="tel" inputMode="tel" {...register("collector.tel")} />
            </Field>
            <Field id="col-notice" label="Special notice" optional hint="e.g. only on Fridays, please check ID">
              <Input {...register("collector.specialNotice")} />
            </Field>
          </div>
        )}
      </Section>
    </div>
  );
}

// ================================================================ 7 Documents

export function DocumentsStep() {
  const { control, setValue } = useFormContext<FormValues>();
  const [docs, single] = useWatch({ control, name: ["documents", "singleGuardian"] });
  const list = DOCUMENTS.filter((d) => !(single && d.who === "father"));
  const done = list.filter((d) => docs[d.key]).length;
  return (
    <div className="flex flex-col gap-5">
      <Note>
        Upload what you have now. Anything missing can be brought to the office later – you can still submit today.
        {" "}
        <strong>{done} of {list.length}</strong> ready.
      </Note>
      <ul className="flex flex-col gap-3">
        {list.map((d) => {
          const file = docs[d.key];
          const inputId = `doc-${d.key}`;
          return (
            <li
              key={d.key}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border-2 bg-white p-4 sm:flex-row sm:items-center",
                file ? "border-green-ink/60" : "border-dashed border-border",
              )}
            >
              <span className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-xl", file ? "bg-green-soft text-green-ink" : "bg-muted text-muted-foreground")}>
                {file ? <CheckCircle2 aria-hidden /> : <FileUp aria-hidden />}
              </span>
              <div className="flex-1">
                <p className="font-medium">{d.label}</p>
                <p className="text-sm text-muted-foreground">
                  {file ? <>Ready: {file}</> : "PDF or photo, up to 10 MB"}
                </p>
              </div>
              {file ? (
                <Button variant="ghost" size="sm" onClick={() => setValue(`documents.${d.key}`, "", { shouldDirty: true })}>
                  <X aria-hidden /> Remove
                </Button>
              ) : (
                <>
                  <label htmlFor={inputId} className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border-2 border-border bg-white px-4 text-sm font-medium hover:bg-muted has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-blue-soft">
                    <FileUp className="size-4" aria-hidden /> Choose file
                    <input
                      id={inputId}
                      type="file"
                      accept="image/*,application/pdf"
                      className="sr-only"
                      aria-label={`Upload ${d.label}`}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        // Demo: we only keep the file name. Nothing is uploaded.
                        if (f) setValue(`documents.${d.key}`, f.name, { shouldDirty: true });
                      }}
                    />
                  </label>
                </>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted-foreground">
        Demo only: files are not uploaded or stored anywhere. In the live system they go to secure, private storage that
        only the office can open.
      </p>
    </div>
  );
}

// ================================================================ 8 Review

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="grid gap-0.5 py-1.5 text-sm sm:grid-cols-[9rem_1fr] sm:gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words">{value || <span className="text-muted-foreground">—</span>}</dd>
    </div>
  );
}

export function PrivacyNotice() {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className="flex items-center gap-2 font-semibold">
        <ShieldCheck className="size-5 text-green-ink" aria-hidden /> How we look after your information
      </p>
      <dl className="grid gap-2">
        <div>
          <dt className="font-medium">What we collect</dt>
          <dd className="text-muted-foreground">
            Your and your child&apos;s contact details, ID numbers, your child&apos;s health information, emergency
            contacts and the documents you upload.
          </dd>
        </div>
        <div>
          <dt className="font-medium">Why</dt>
          <dd className="text-muted-foreground">
            To process this application, care for your child safely, act in a medical emergency and meet our legal
            obligations.
          </dd>
        </div>
        <div>
          <dt className="font-medium">Who sees it</dt>
          <dd className="text-muted-foreground">
            Only Lil Angels staff. The principal and office administrator see everything. Teachers see contact and
            emergency details, not full medical history. We never sell or share your information.
          </dd>
        </div>
        <div>
          <dt className="font-medium">How long we keep it</dt>
          <dd className="text-muted-foreground">
            While your child is with us, and for a limited time afterwards as the law requires. Applications that
            don&apos;t go ahead are deleted after 12 months.
          </dd>
        </div>
        <div>
          <dt className="font-medium">Your rights</dt>
          <dd className="text-muted-foreground">
            You can ask to see, correct or delete your information at any time by emailing {CENTRE.email}.
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function ReviewStep({ programmes, goTo }: { programmes: Programme[]; goTo: (step: number) => void }) {
  const { register, control } = useFormContext<FormValues>();
  const errors = useErrors();
  const v = useWatch({ control }) as FormValues;
  const prog = programmes.find((p) => p.id === v.programme);
  const fees = calculateFees(prog, { swimming: v.swimming, siblingDiscount: v.siblingDiscount });
  const docList = DOCUMENTS.filter((d) => !(v.singleGuardian && d.who === "father"));
  const docCount = docList.filter((d) => v.documents?.[d.key]).length;
  const today = new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });

  const block = (title: string, step: number, children: React.ReactNode) => (
    <Section>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold">{title}</h3>
        <Button variant="link" size="sm" onClick={() => goTo(step)} aria-label={`Edit ${STEPS[step].title}`}>
          <Pencil aria-hidden /> Edit
        </Button>
      </div>
      <dl className="divide-y divide-border/60">{children}</dl>
    </Section>
  );

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">Nearly done! Please check everything below, then sign.</p>
      {block(
        "Programme",
        0,
        <>
          <Row label="Programme" value={prog?.name} />
          <Row label="Swimming" value={v.swimming ? `Yes – ${rand(SWIMMING.pricePerTerm)} per term` : "No"} />
          <Row label="Monthly total" value={`${rand(fees.monthlyTotal)}${v.siblingDiscount ? " (incl. 10% sibling discount)" : ""}`} />
        </>,
      )}
      {block(
        "Mother / guardian",
        1,
        <>
          <Row label="Name" value={v.mother?.fullName} />
          <Row label="Cell" value={v.mother?.cell} />
          <Row label="Email" value={v.mother?.email} />
        </>,
      )}
      {block(
        "Father / guardian",
        2,
        v.singleGuardian ? (
          <Row label="Status" value="Single parent / guardian" />
        ) : (
          <>
            <Row label="Name" value={v.father?.fullName} />
            <Row label="Cell" value={v.father?.cell} />
            <Row label="Email" value={v.father?.email} />
          </>
        ),
      )}
      {block(
        "Your child",
        3,
        <>
          <Row label="Name" value={`${v.child?.fullName ?? ""} ${v.child?.surname ?? ""}`.trim()} />
          <Row label="Date of birth" value={v.child?.dateOfBirth} />
          <Row label="Home language" value={v.child?.homeLanguage} />
        </>,
      )}
      {block(
        "Health",
        4,
        <>
          <Row label="Allergies" value={v.health?.allergies || "None noted"} />
          <Row label="Medication" value={v.health?.medication || "None noted"} />
          <Row label="Emergency info" value={v.health?.emergencyInfo} />
        </>,
      )}
      {block(
        "Emergency contacts",
        5,
        <>
          {v.emergencyContacts?.map((c, i) => (
            <Row key={i} label={`Contact ${i + 1}`} value={`${c.name} ${c.surname} (${c.relationship}) · ${c.cell}`} />
          ))}
          <Row label="Collection" value={v.collectorEnabled ? `${v.collector?.fullName} (${v.collector?.relationship})` : "Parents only"} />
        </>,
      )}
      {block("Documents", 6, <Row label="Ready" value={`${docCount} of ${docList.length} documents`} />)}

      <Section className="border-2 border-green/50">
        <PrivacyNotice />
        <Choice
          type="checkbox"
          {...register("privacyAccepted")}
          label="I have read the privacy notice and agree that Lil Angels may use my information as described."
        />
        {errors.privacyAccepted?.message && <p className="text-sm font-medium text-red-ink">{errors.privacyAccepted.message}</p>}
      </Section>

      <Section title="Declaration">
        <Choice
          type="checkbox"
          {...register("declarationAccepted")}
          label="To the best of my knowledge the above information is accurate and correct."
        />
        {errors.declarationAccepted?.message && (
          <p className="text-sm font-medium text-red-ink">{errors.declarationAccepted.message}</p>
        )}
        <Signature who="mother" title="Mother / guardian" today={today} />
        {!v.singleGuardian && <Signature who="father" title="Father / guardian" today={today} />}
      </Section>
    </div>
  );
}

function Signature({ who, title, today }: { who: "mother" | "father"; title: string; today: string }) {
  const { register, control } = useFormContext<FormValues>();
  const errors = useErrors();
  const sigName = `${who}Signature` as const;
  const placeName = `${who}Place` as const;
  const sig = useWatch({ control, name: sigName });
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-cream p-4">
      <p className="text-sm font-semibold">{title} signature</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field id={`${who}-sig`} label="Type your full name to sign" error={errors[sigName]?.message}>
          <Input autoComplete="name" {...register(sigName)} />
        </Field>
        <Field id={`${who}-place`} label="Place" error={errors[placeName]?.message}>
          <Input placeholder="e.g. Table View" {...register(placeName)} />
        </Field>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-dashed border-charcoal/30 pb-1">
        <span className="min-h-9 font-script text-3xl" aria-hidden>
          {sig}
        </span>
        <span className="text-xs text-muted-foreground">Date: {today}</span>
      </div>
    </div>
  );
}
