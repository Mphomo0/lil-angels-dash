// Domain types for a Lil Angels registration.
// Field names mirror the paper Application Form so the mapping to a future
// Postgres schema stays obvious.

export type Status = "new" | "waitlist" | "accepted" | "enrolled" | "declined";

export type ProgrammeId = "full" | "three-quarter" | "half" | "aftercare";

export type AgeGroup =
  | "baby"
  | "toddler"
  | "grade-00"
  | "grade-0"
  | "grade-r"
  | "aftercare";

export type YesNo = "yes" | "no";

export type Role = "admin" | "staff";

export type DocumentKey =
  | "motherId"
  | "motherResidence"
  | "fatherId"
  | "fatherResidence"
  | "birthCertificate"
  | "immunisation"
  | "medicalAid"
  | "proofOfPayment";

export interface Programme {
  id: ProgrammeId;
  name: string;
  hours: string;
  extraHours?: string;
  inclusions: string;
  pricePerMonth: number;
}

export interface Guardian {
  fullName: string;
  homeAddress: string;
  domiciliumAddress: string;
  idNumber: string;
  cell: string;
  maritalStatus: string;
  religion?: string;
  occupation: string;
  employerName: string;
  employerAddress: string;
  email: string;
  workContact: string;
}

export interface PreviousCentre {
  name: string;
  city: string;
  tel: string;
}

export interface ChildInfo {
  dateOfBirth: string; // ISO yyyy-mm-dd
  surname: string;
  fullName: string;
  homeLanguage: string;
  homePhone: string;
  homeAddress: string;
  householdChildren: number;
  householdAges: string;
  primaryCaregiver: string;
  biologicalParents: YesNo;
  previousCentres: PreviousCentre[];
}

export interface Health {
  illnesses: string[];
  otherIllnesses: string;
  medication: string;
  allergies: string;
  hearing: string;
  sight: string;
  speech: string;
  toiletTrained: "yes" | "no" | "learning" | "not-yet-applicable";
  bedWetting: YesNo;
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
  permissionFamilyDoctor: YesNo;
  permissionNearestDoctor: YesNo;
  ambulanceCover: string;
  emergencyInfo: string;
}

export interface EmergencyContact {
  name: string;
  surname: string;
  relationship: string;
  cell: string;
  workTel: string;
}

export interface Collector {
  fullName: string;
  relationship: string;
  tel: string;
  specialNotice: string;
}

export interface DocumentStatus {
  received: boolean;
  fileName?: string;
}

export interface Signature {
  name: string;
  date: string;
  place: string;
}

export interface Note {
  id: string;
  at: string;
  author: string;
  text: string;
}

export interface Activity {
  id: string;
  at: string;
  actor: string;
  text: string;
}

export interface Registration {
  id: string;
  registrationNumber: string;
  status: Status;
  submittedAt: string; // ISO datetime
  admissionDate?: string; // ISO date, set when accepted / enrolled
  programme: ProgrammeId;
  swimming: boolean;
  siblingDiscount: boolean;
  mother: Guardian;
  singleGuardian: boolean;
  father: Guardian | null;
  child: ChildInfo;
  health: Health;
  emergencyContacts: EmergencyContact[];
  collector: Collector | null;
  documents: Record<DocumentKey, DocumentStatus>;
  declaration: {
    mother: Signature;
    father: Signature | null;
  };
  consent: {
    privacyNoticeAccepted: boolean;
    acceptedAt: string;
  };
  notes: Note[];
  activity: Activity[];
}

/** What the parent form submits. The data layer adds ids, status and logs. */
export type RegistrationInput = Omit<
  Registration,
  | "id"
  | "registrationNumber"
  | "status"
  | "submittedAt"
  | "admissionDate"
  | "notes"
  | "activity"
>;

export interface StaffMember {
  id: string;
  name: string;
  role: Role;
  title: string;
  site: "Daycare" | "Aftercare" | "Both";
  email: string;
}
