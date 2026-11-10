import { z } from "zod";
import type { Collector, DocumentKey, EmergencyContact, PreviousCentre, ProgrammeId } from "@/lib/types";

// ------------------------------------------------------------------ values

export interface GuardianValues {
  fullName: string;
  homeAddress: string;
  domiciliumAddress: string;
  idNumber: string;
  cell: string;
  maritalStatus: string;
  religion: string;
  occupation: string;
  employerName: string;
  employerAddress: string;
  email: string;
  workContact: string;
}

export interface FormValues {
  programme: ProgrammeId | "";
  swimming: boolean;
  siblingDiscount: boolean;
  mother: GuardianValues;
  singleGuardian: boolean;
  father: GuardianValues;
  child: {
    dateOfBirth: string;
    surname: string;
    fullName: string;
    homeLanguage: string;
    homePhone: string;
    homeAddress: string;
    householdChildren: string;
    householdAges: string;
    primaryCaregiver: string;
    biologicalParents: "" | "yes" | "no";
    previousCentres: PreviousCentre[];
  };
  health: {
    illnesses: string[];
    otherIllnesses: string;
    medication: string;
    allergies: string;
    hearing: string;
    sight: string;
    speech: string;
    toiletTrained: "" | "yes" | "no" | "learning" | "not-yet-applicable";
    bedWetting: "" | "yes" | "no";
    bedtime: string;
    nervousness: string;
    referrals: string[];
    referralReasons: string;
    supportConditions: string;
    otherWellbeing: string;
    doctorName: string;
    doctorContact: string;
    medicalAidName: string;
    medicalAidNumber: string;
    permissionFamilyDoctor: "" | "yes" | "no";
    permissionNearestDoctor: "" | "yes" | "no";
    ambulanceCover: string;
    emergencyInfo: string;
  };
  emergencyContacts: EmergencyContact[];
  collectorEnabled: boolean;
  collector: Collector;
  documents: Record<DocumentKey, string>;
  privacyAccepted: boolean;
  declarationAccepted: boolean;
  motherSignature: string;
  motherPlace: string;
  fatherSignature: string;
  fatherPlace: string;
}

const emptyGuardian = (): GuardianValues => ({
  fullName: "",
  homeAddress: "",
  domiciliumAddress: "",
  idNumber: "",
  cell: "",
  maritalStatus: "",
  religion: "",
  occupation: "",
  employerName: "",
  employerAddress: "",
  email: "",
  workContact: "",
});

export const emptyContact = (): EmergencyContact => ({ name: "", surname: "", relationship: "", cell: "", workTel: "" });

export function defaultValues(): FormValues {
  return {
    programme: "",
    swimming: false,
    siblingDiscount: false,
    mother: emptyGuardian(),
    singleGuardian: false,
    father: emptyGuardian(),
    child: {
      dateOfBirth: "",
      surname: "",
      fullName: "",
      homeLanguage: "",
      homePhone: "",
      homeAddress: "",
      householdChildren: "1",
      householdAges: "",
      primaryCaregiver: "",
      biologicalParents: "",
      previousCentres: [
        { name: "", city: "", tel: "" },
        { name: "", city: "", tel: "" },
      ],
    },
    health: {
      illnesses: [],
      otherIllnesses: "",
      medication: "",
      allergies: "",
      hearing: "",
      sight: "",
      speech: "",
      toiletTrained: "",
      bedWetting: "",
      bedtime: "",
      nervousness: "",
      referrals: [],
      referralReasons: "",
      supportConditions: "",
      otherWellbeing: "",
      doctorName: "",
      doctorContact: "",
      medicalAidName: "",
      medicalAidNumber: "",
      permissionFamilyDoctor: "",
      permissionNearestDoctor: "",
      ambulanceCover: "",
      emergencyInfo: "",
    },
    emergencyContacts: [emptyContact()],
    collectorEnabled: false,
    collector: { fullName: "", relationship: "", tel: "", specialNotice: "" },
    documents: {
      motherId: "",
      motherResidence: "",
      fatherId: "",
      fatherResidence: "",
      birthCertificate: "",
      immunisation: "",
      medicalAid: "",
      proofOfPayment: "",
    },
    privacyAccepted: false,
    declarationAccepted: false,
    motherSignature: "",
    motherPlace: "",
    fatherSignature: "",
    fatherPlace: "",
  };
}

// ------------------------------------------------------------------ schemas

const req = (message: string) => z.string().trim().min(1, message);
const phone = (message = "Please enter a phone number we can reach") =>
  z
    .string()
    .trim()
    .min(1, message)
    .regex(/^[0-9 +()-]{9,}$/, "That doesn't look like a phone number – please check it");
const optionalPhone = z
  .string()
  .trim()
  .refine((v) => v === "" || /^[0-9 +()-]{9,}$/.test(v), "That doesn't look like a phone number – please check it");
const yesNo = (message: string) => z.string().refine((v) => v === "yes" || v === "no", message);

const guardianSchema = z.looseObject({
  fullName: req("Please enter a name and surname"),
  homeAddress: req("Please enter a home address"),
  domiciliumAddress: req("Please enter an address for legal notices (it can be the same as home)"),
  idNumber: req("Please enter an ID or passport number"),
  cell: phone(),
  maritalStatus: req("Please choose one"),
  email: z.string().trim().min(1, "Please enter an email address").email("Please check the email address"),
  workContact: optionalPhone,
});

const childSchema = z.looseObject({
  dateOfBirth: req("Please enter your child's date of birth").refine((v) => {
    const d = new Date(v);
    const now = new Date();
    return !Number.isNaN(d.getTime()) && d <= now && now.getFullYear() - d.getFullYear() <= 13;
  }, "Please check the date of birth"),
  surname: req("Please enter your child's surname"),
  fullName: req("Please enter your child's full name"),
  homeLanguage: req("Please tell us the language spoken at home"),
  homePhone: optionalPhone,
  homeAddress: req("Please enter a home address"),
  householdChildren: z.string().refine((v) => Number(v) >= 1 && Number(v) <= 15, "Please enter a number"),
  primaryCaregiver: req("Please tell us who looks after your child most of the time"),
  biologicalParents: yesNo("Please choose yes or no"),
});

const contactSchema = z.looseObject({
  name: req("Please enter a first name"),
  surname: req("Please enter a surname"),
  relationship: req("How are they related to your child?"),
  cell: phone("Please enter a cell number"),
  workTel: optionalPhone,
});

/** One schema per step; the form only validates the step you're on. */
export const STEP_SCHEMAS = [
  // 1. Programme
  z.looseObject({
    programme: z.string().refine((v) => v !== "", "Please choose a programme"),
  }),
  // 2. Mother / guardian
  z.looseObject({ mother: guardianSchema }),
  // 3. Father / guardian (skippable)
  z
    .looseObject({ singleGuardian: z.boolean(), father: z.any() })
    .superRefine((v, ctx) => {
      if (v.singleGuardian) return;
      const r = guardianSchema.safeParse(v.father);
      if (!r.success) {
        for (const issue of r.error.issues) {
          ctx.addIssue({ code: "custom", message: issue.message, path: ["father", ...issue.path] });
        }
      }
    }),
  // 4. Child
  z.looseObject({ child: childSchema }),
  // 5. Health
  z.looseObject({
    health: z.looseObject({
      permissionFamilyDoctor: yesNo("Please choose yes or no"),
      permissionNearestDoctor: yesNo("Please choose yes or no"),
    }),
  }),
  // 6. Emergency contacts
  z
    .looseObject({
      emergencyContacts: z.array(contactSchema).min(1, "Please add at least one emergency contact").max(4),
      collectorEnabled: z.boolean(),
      collector: z.any(),
    })
    .superRefine((v, ctx) => {
      if (!v.collectorEnabled) return;
      if (!v.collector?.fullName?.trim())
        ctx.addIssue({ code: "custom", message: "Please enter their name and surname", path: ["collector", "fullName"] });
      if (!v.collector?.relationship?.trim())
        ctx.addIssue({ code: "custom", message: "How are they related to your child?", path: ["collector", "relationship"] });
      if (!/^[0-9 +()-]{9,}$/.test(v.collector?.tel ?? ""))
        ctx.addIssue({ code: "custom", message: "Please enter a phone number", path: ["collector", "tel"] });
    }),
  // 7. Documents – nothing required now, they can be delivered later.
  z.looseObject({}),
  // 8. Review, consent and declaration
  z
    .looseObject({
      singleGuardian: z.boolean(),
      privacyAccepted: z.literal(true, { error: "Please read and accept the privacy notice" }),
      declarationAccepted: z.literal(true, { error: "Please confirm the information is correct" }),
      motherSignature: req("Please type your full name to sign"),
      motherPlace: req("Please enter the place (e.g. Table View)"),
      fatherSignature: z.string(),
      fatherPlace: z.string(),
    })
    .superRefine((v, ctx) => {
      if (v.singleGuardian) return;
      if (!v.fatherSignature.trim())
        ctx.addIssue({ code: "custom", message: "Please type the father / guardian's full name to sign", path: ["fatherSignature"] });
      if (!v.fatherPlace.trim())
        ctx.addIssue({ code: "custom", message: "Please enter the place", path: ["fatherPlace"] });
    }),
];

export const STEPS = [
  { id: "programme", title: "Programme", heading: "Which programme would you like?" },
  { id: "mother", title: "Mother / guardian", heading: "Mother or guardian's details" },
  { id: "father", title: "Father / guardian", heading: "Father or guardian's details" },
  { id: "child", title: "Your child", heading: "About your child" },
  { id: "health", title: "Health", heading: "Health questionnaire" },
  { id: "emergency", title: "Emergency contacts", heading: "Emergency contacts and collection" },
  { id: "documents", title: "Documents", heading: "Documents checklist" },
  { id: "review", title: "Review and sign", heading: "Review, consent and sign" },
] as const;
