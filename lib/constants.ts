import type { AgeGroup, DocumentKey, Programme, ProgrammeId, Status } from "./types";

// Centre details, from the letterhead of the Application Form.
export const CENTRE = {
  name: "Lil Angels Daycare and Aftercare Centre",
  tagline: "We put the care into daycare...",
  levels: "BABY | TODDLER | GRADE R | AFTERCARE",
  email: "info@lilangelsdaycare.co.za",
  website: "www.lilangelsdaycare.co.za",
  sites: [
    {
      id: "daycare",
      name: "Daycare",
      address: "44 South Road, Tableview, 7441",
      tel: "021 556 2121",
      cell: undefined as string | undefined,
    },
    {
      id: "aftercare",
      name: "Aftercare",
      address: "23 Fairway Road, Tableview, 7441",
      tel: "021 556 2452",
      cell: "084 656 0437",
    },
  ],
};

// Programmes and monthly prices (Mon–Fri, excl. public holidays).
export const DEFAULT_PROGRAMMES: Programme[] = [
  {
    id: "full",
    name: "Pre-primary full day",
    hours: "06h30 – 18h00",
    inclusions: "Full day of care, Monday to Friday",
    pricePerMonth: 3600,
  },
  {
    id: "three-quarter",
    name: "Three-quarter day",
    hours: "08h00 – 14h30",
    inclusions: "Includes breakfast, cooked lunch and afternoon snack",
    pricePerMonth: 3200,
  },
  {
    id: "half",
    name: "Half day",
    hours: "08h00 – 12h30",
    inclusions: "Includes breakfast and cooked lunch",
    pricePerMonth: 3000,
  },
  {
    id: "aftercare",
    name: "Aftercare",
    hours: "12h45 – 18h00",
    extraHours: "06h30 – 07h30 early drop-off (optional)",
    inclusions:
      "Includes cooked lunch and a snack. School drop-off and collection is optional",
    pricePerMonth: 1900,
  },
];

export const SWIMMING = {
  name: "Swimming lessons",
  pricePerTerm: 750,
  description: "Per term (3 months), summer months October – April",
};

export const SIBLING_DISCOUNT = 0.1;
export const APPLICATION_FEE = 600;

export const STATUSES: { id: Status; label: string }[] = [
  { id: "new", label: "New" },
  { id: "waitlist", label: "Waitlist" },
  { id: "accepted", label: "Accepted" },
  { id: "enrolled", label: "Enrolled" },
  { id: "declined", label: "Declined" },
];

export const STATUS_LABEL: Record<Status, string> = Object.fromEntries(
  STATUSES.map((s) => [s.id, s.label]),
) as Record<Status, string>;

export const AGE_GROUPS: { id: AgeGroup; label: string; range: string }[] = [
  { id: "baby", label: "Baby", range: "Under 1 year" },
  { id: "toddler", label: "Toddler", range: "1 – 2½ years (Yellow Class)" },
  { id: "grade-00", label: "Grade 00", range: "2½ – 4 years (Red Class)" },
  { id: "grade-0", label: "Grade 0", range: "4 – 5 years (Green Class)" },
  { id: "grade-r", label: "Grade R", range: "5 – 6 years" },
  { id: "aftercare", label: "Aftercare", range: "School-going" },
];

export const AGE_GROUP_LABEL: Record<AgeGroup, string> = Object.fromEntries(
  AGE_GROUPS.map((g) => [g.id, g.label]),
) as Record<AgeGroup, string>;

export const PROGRAMME_SHORT: Record<ProgrammeId, string> = {
  full: "Full day",
  "three-quarter": "¾ day",
  half: "Half day",
  aftercare: "Aftercare",
};

// Note: the paper form also lists HIV-Positive and Aids. These are left out of
// the demo on purpose (see README, POPIA notes).
export const ILLNESSES = [
  "Chicken pox",
  "Diphtheria",
  "Typhoid",
  "Measles",
  "Mumps",
  "Scarlet fever",
  "Whooping cough",
  "Convulsions",
  "Epileptic fits",
  "Hepatitis B",
  "TB",
  "German measles",
];

export const REFERRALS = ["Occupational therapist", "Speech therapist", "Psychologist"];

export const DOCUMENTS: { key: DocumentKey; label: string; who: "mother" | "father" | "child" | "payment" }[] = [
  { key: "motherId", label: "Mother / guardian's ID document", who: "mother" },
  { key: "motherResidence", label: "Mother / guardian's proof of residence", who: "mother" },
  { key: "fatherId", label: "Father / guardian's ID document", who: "father" },
  { key: "fatherResidence", label: "Father / guardian's proof of residence", who: "father" },
  { key: "birthCertificate", label: "Child's birth certificate", who: "child" },
  { key: "immunisation", label: "Child's immunisation record", who: "child" },
  { key: "medicalAid", label: "Medical aid card / certificate of membership", who: "child" },
  { key: "proofOfPayment", label: "Proof of payment of the R600 application fee", who: "payment" },
];

export const MARITAL_STATUSES = [
  "Single",
  "Married",
  "Living together",
  "Divorced",
  "Separated",
  "Widowed",
  "Prefer not to say",
];
