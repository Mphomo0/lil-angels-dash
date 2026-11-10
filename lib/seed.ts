/**
 * FAKE seed data for the concept demo.
 *
 * Every person here is invented. Phone numbers use the 021 000 xxxx / 080 000
 * xxxx pattern, emails use @example.com, and ID / medical aid numbers start
 * with "DEMO" so they can never be mistaken for real identifiers.
 *
 * Data is generated from a fixed random seed, so it is the same on every load.
 * Dates are relative to "today" so the dashboard always has fresh activity.
 */
import { ILLNESSES } from "./constants";
import type {
  Activity,
  AgeGroup,
  DocumentKey,
  DocumentStatus,
  EmergencyContact,
  Guardian,
  Note,
  ProgrammeId,
  Registration,
  StaffMember,
  Status,
} from "./types";

// Small deterministic PRNG (mulberry32).
function prng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CHILD_FIRST = [
  "Lethabo", "Amahle", "Liam", "Zoë", "Siyabonga", "Kayla", "Ruan", "Imaan",
  "Naledi", "Ethan", "Anika", "Lwazi", "Aaliyah", "Bongani", "Emma", "Tristan",
  "Lerato", "Mihlali", "Riya", "Daniel", "Thandiwe", "Jayden", "Keziah", "Pieter",
  "Ayesha",
];
const SURNAMES = [
  "Naidoo", "Dlamini", "van der Merwe", "Adams", "Mokoena", "Botha", "Jacobs",
  "Pillay", "Nkosi", "Petersen", "Fourie", "Ndlovu", "Hendricks", "Khumalo",
  "Smith", "le Roux", "Isaacs", "Mthembu", "Govender", "Williams", "Daniels",
  "Coetzee", "Zulu", "Abrahams", "Steyn",
];
const MOTHER_FIRST = [
  "Nomvula", "Fatima", "Michelle", "Zanele", "Chantal", "Priya", "Lindiwe",
  "Megan", "Thembi", "Shireen", "Annelie", "Busisiwe", "Natasha", "Refilwe",
  "Sarah", "Yolandi", "Nadia", "Palesa", "Kavitha", "Jessica", "Naomi",
  "Marlize", "Ntombi", "Raeesa", "Elmarie",
];
const FATHER_FIRST = [
  "Sipho", "Yusuf", "Johan", "Thabo", "Craig", "Rajesh", "Mandla", "Brendan",
  "Kagiso", "Ashraf", "Gerhard", "Themba", "Wayne", "Tumelo", "Andrew",
  "Francois", "Riaan", "Lebo", "Vikesh", "Mark", "Lungile", "Hennie", "Jabu",
  "Zaid", "Werner",
];
const STREETS = [
  "Pentz Drive", "Raats Drive", "Janssens Avenue", "Blaauwberg Road",
  "Sandown Road", "Wood Drive", "Parklands Main Road", "Marine Drive",
  "Bayside Close", "Arum Crescent", "Seagull Street", "Protea Lane",
];
const SUBURBS = [
  "Table View", "Table View", "Table View", "Parklands", "Blouberg",
  "Sunningdale", "West Beach", "Flamingo Vlei",
];
const LANGUAGES = ["English", "English", "Afrikaans", "isiXhosa", "isiZulu", "English and Afrikaans", "Sesotho"];
const OCCUPATIONS = [
  "Nurse", "Teacher", "Accountant", "Software developer", "Electrician",
  "Pharmacist", "Sales manager", "Paralegal", "Chef", "Physiotherapist",
  "Civil engineer", "Hairdresser", "Logistics coordinator", "Graphic designer",
];
const EMPLOYERS = [
  "Seaside Clinic (Pty) Ltd", "Blouberg Primary School", "Example Logistics",
  "Bayview Pharmacy", "Coastline Engineering", "Sample Retail Group",
  "Atlantic Software Co.", "Demo Bank Ltd", "Self-employed",
];
const RELIGIONS = ["", "", "Christian", "Muslim", "Hindu", "Prefer not to say"];
const MEDICAL_AIDS = ["Demo Health", "Sample Med", "Example Care Plus", "None"];

const DOCTORS = ["Dr A. Example", "Dr N. Sample", "Dr P. Placeholder", "Dr T. Demo"];

// [ageGroup, status] plan for the 25 children so the dashboard has a good mix.
const PLAN: [AgeGroup, Status][] = [
  ["baby", "new"], ["toddler", "new"], ["grade-00", "new"], ["aftercare", "new"],
  ["grade-r", "new"], ["toddler", "new"], ["aftercare", "new"],
  ["baby", "waitlist"], ["toddler", "waitlist"], ["grade-0", "waitlist"],
  ["aftercare", "waitlist"], ["grade-00", "waitlist"],
  ["grade-r", "accepted"], ["toddler", "accepted"], ["aftercare", "accepted"],
  ["grade-0", "accepted"],
  ["grade-00", "enrolled"], ["grade-r", "enrolled"], ["aftercare", "enrolled"],
  ["baby", "enrolled"], ["grade-0", "enrolled"], ["grade-r", "enrolled"],
  ["aftercare", "enrolled"],
  ["toddler", "declined"], ["grade-00", "declined"],
];

const AGE_MONTHS: Record<AgeGroup, [number, number]> = {
  baby: [4, 11],
  toddler: [13, 29],
  "grade-00": [31, 47],
  "grade-0": [49, 59],
  "grade-r": [61, 71],
  aftercare: [74, 118],
};

const DAY = 86_400_000;

function iso(d: Date) {
  return d.toISOString();
}
function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function buildSeed(now = new Date()): Registration[] {
  const r = prng(20261110);
  const pick = <T,>(arr: T[]) => arr[Math.floor(r() * arr.length)];
  const int = (min: number, max: number) => Math.floor(r() * (max - min + 1)) + min;
  const digits = (n: number) => Array.from({ length: n }, () => int(0, 9)).join("");
  const cell = () => `080 000 ${digits(4)}`;
  const landline = () => `021 000 ${digits(4)}`;
  const fakeId = () => `DEMO ${digits(4)} ${digits(4)}`;

  return PLAN.map(([group, status], i) => {
    const firstName = CHILD_FIRST[i];
    const surname = SURNAMES[i];
    const suburb = pick(SUBURBS);
    const address = `${int(3, 120)} ${pick(STREETS)}, ${suburb}, Cape Town, 7441`;
    const singleGuardian = i % 6 === 4;

    const months = int(...AGE_MONTHS[group]);
    const dob = new Date(now.getTime() - months * 30.44 * DAY - int(0, 20) * DAY);

    const programme: ProgrammeId =
      group === "aftercare" ? "aftercare" : pick<ProgrammeId>(["full", "full", "three-quarter", "half"]);

    // Submission date: "new" ones are recent, enrolled ones are older.
    const daysAgo =
      status === "new"
        ? int(0, i % 3 === 0 ? 9 : 6)
        : status === "waitlist"
          ? int(10, 60)
          : status === "accepted"
            ? int(20, 75)
            : status === "enrolled"
              ? int(90, 400)
              : int(30, 120);
    const submitted = new Date(now.getTime() - daysAgo * DAY - int(1, 10) * 3_600_000);

    const motherFirst = MOTHER_FIRST[i];
    const fatherFirst = FATHER_FIRST[i];
    const emailSlug = surname.toLowerCase().replace(/\s+/g, "");

    const guardian = (first: string): Guardian => ({
      fullName: `${first} ${surname}`,
      homeAddress: address,
      domiciliumAddress: address,
      idNumber: fakeId(),
      cell: cell(),
      maritalStatus: singleGuardian ? pick(["Single", "Divorced", "Widowed"]) : pick(["Married", "Married", "Living together"]),
      religion: pick(RELIGIONS),
      occupation: pick(OCCUPATIONS),
      employerName: pick(EMPLOYERS),
      employerAddress: `${int(1, 90)} Example Street, Century City, 7441`,
      email: `${first.toLowerCase()}.${emailSlug}@example.com`,
      workContact: landline(),
    });

    const mother = guardian(motherFirst);
    const father = singleGuardian ? null : guardian(fatherFirst);

    const householdChildren = i % 5 === 1 ? 2 : int(1, 3);
    const illnesses = ILLNESSES.filter(() => r() < 0.08);
    const allergy = pick(["", "", "", "Peanuts", "Penicillin", "Bee stings", "Lactose intolerant", "Eggs"]);
    const asthma = r() < 0.15;
    const medicalAid = pick(MEDICAL_AIDS);

    const contacts: EmergencyContact[] = [
      {
        name: pick(MOTHER_FIRST),
        surname: pick(SURNAMES),
        relationship: pick(["Grandmother", "Aunt", "Family friend", "Neighbour"]),
        cell: cell(),
        workTel: landline(),
      },
    ];
    if (r() < 0.7) {
      contacts.push({
        name: pick(FATHER_FIRST),
        surname: pick(SURNAMES),
        relationship: pick(["Grandfather", "Uncle", "Godparent"]),
        cell: cell(),
        workTel: "",
      });
    }

    // Documents: enrolled mostly complete, new ones mostly incomplete.
    const completeChance =
      status === "enrolled" ? 0.97 : status === "accepted" ? 0.85 : status === "waitlist" ? 0.7 : 0.45;
    const documents = {} as Record<DocumentKey, DocumentStatus>;
    const keys: DocumentKey[] = [
      "motherId", "motherResidence", "fatherId", "fatherResidence",
      "birthCertificate", "immunisation", "medicalAid", "proofOfPayment",
    ];
    for (const k of keys) {
      const notApplicable = singleGuardian && k.startsWith("father");
      const received = !notApplicable && (k === "proofOfPayment" ? r() < 0.92 : r() < completeChance);
      documents[k] = received ? { received, fileName: `${k}-${emailSlug}.pdf` } : { received: false };
    }

    const regNo = `LA-${submitted.getFullYear()}-${String(101 + i).padStart(4, "0")}`;

    const activity: Activity[] = [
      { id: `a${i}-1`, at: iso(submitted), actor: "Parent (online form)", text: "Application submitted online" },
    ];
    const notes: Note[] = [];
    const staffNames = ["Thandi (Admin)", "Michelle (Staff)", "Busi (Staff)"];
    if (status !== "new") {
      const t = new Date(submitted.getTime() + int(1, 4) * DAY);
      activity.push({ id: `a${i}-2`, at: iso(t), actor: pick(staffNames), text: "Viewing booked for 09:00" });
      notes.push({
        id: `n${i}-1`,
        at: iso(t),
        author: pick(staffNames),
        text: pick([
          "Lovely family, came for a viewing. Keen to start next term.",
          "Mom asked about the swimming lessons in summer.",
          "Needs a space in the Yellow Class from January.",
          "Older sibling attended Lil Angels a few years ago.",
          "Asked about school collection from Table View Primary.",
        ]),
      });
    }
    const statusTrail: Status[] =
      status === "waitlist" ? ["waitlist"]
        : status === "accepted" ? ["waitlist", "accepted"]
          : status === "enrolled" ? ["accepted", "enrolled"]
            : status === "declined" ? ["declined"]
              : [];
    statusTrail.forEach((s, j) => {
      const t = new Date(submitted.getTime() + (5 + j * 7) * DAY);
      if (t.getTime() < now.getTime()) {
        activity.push({
          id: `a${i}-s${j}`,
          at: iso(t),
          actor: "Thandi (Admin)",
          text: `Status changed to ${s[0].toUpperCase()}${s.slice(1)}`,
        });
      }
    });

    const admissionDate =
      status === "accepted" || status === "enrolled"
        ? isoDate(new Date(submitted.getTime() + int(14, 40) * DAY))
        : undefined;

    const reg: Registration = {
      id: `child-${String(i + 1).padStart(2, "0")}`,
      registrationNumber: regNo,
      status,
      submittedAt: iso(submitted),
      admissionDate,
      programme,
      swimming: r() < 0.35,
      siblingDiscount: householdChildren >= 2 && r() < 0.5,
      mother,
      singleGuardian,
      father,
      child: {
        dateOfBirth: isoDate(dob),
        surname,
        fullName: firstName,
        homeLanguage: pick(LANGUAGES),
        homePhone: landline(),
        homeAddress: address,
        householdChildren,
        householdAges: householdChildren > 1 ? `${Math.floor(months / 12)}, ${int(3, 11)}` : `${Math.floor(months / 12)}`,
        primaryCaregiver: mother.fullName,
        biologicalParents: r() < 0.9 ? "yes" : "no",
        previousCentres:
          group === "baby" || r() < 0.5
            ? []
            : [{ name: pick(["Little Stars Playschool", "Seaside Sprouts", "Busy Bees Creche"]), city: "Cape Town", tel: landline() }],
      },
      health: {
        illnesses,
        otherIllnesses: asthma ? "Mild asthma" : "",
        medication: asthma ? "Asthma pump (as needed)" : "",
        allergies: allergy,
        hearing: "No",
        sight: r() < 0.06 ? "Wears glasses" : "No",
        speech: r() < 0.08 ? "Slight lisp" : "No",
        toiletTrained:
          group === "baby" ? "not-yet-applicable" : group === "toddler" ? pick(["learning", "no", "yes"]) : "yes",
        bedWetting: r() < 0.1 ? "yes" : "no",
        bedtime: pick(["18:30", "19:00", "19:00", "19:30", "20:00"]),
        nervousness: r() < 0.15 ? "A little shy with new people at first" : "No",
        referrals: r() < 0.1 ? ["Speech therapist"] : [],
        referralReasons: "",
        supportConditions: asthma ? "Asthma pump kept in the office" : "",
        otherWellbeing: "",
        doctorName: pick(DOCTORS),
        doctorContact: landline(),
        medicalAidName: medicalAid,
        medicalAidNumber: medicalAid === "None" ? "" : `DEMO-MA-${digits(6)}`,
        permissionFamilyDoctor: "yes",
        permissionNearestDoctor: "yes",
        ambulanceCover: medicalAid === "None" ? "No" : "Yes, through medical aid",
        emergencyInfo: allergy === "Penicillin" ? "ALLERGIC TO PENICILLIN" : asthma ? "Asthmatic – pump in bag" : "",
      },
      emergencyContacts: contacts,
      collector:
        r() < 0.6
          ? {
              fullName: `${pick(MOTHER_FIRST)} ${pick(SURNAMES)}`,
              relationship: pick(["Grandmother", "Au pair", "Aunt", "Family friend"]),
              tel: cell(),
              specialNotice: pick(["", "Collects on Tuesdays and Thursdays", "Please check ID on first collection"]),
            }
          : null,
      documents,
      declaration: {
        mother: { name: mother.fullName, date: isoDate(submitted), place: "Table View" },
        father: father ? { name: father.fullName, date: isoDate(submitted), place: "Table View" } : null,
      },
      consent: { privacyNoticeAccepted: true, acceptedAt: iso(submitted) },
      notes,
      activity: activity.sort((a, b) => b.at.localeCompare(a.at)),
    };
    return reg;
  });
}

export const SEED_STAFF: StaffMember[] = [
  { id: "s1", name: "Principal (demo)", role: "admin", title: "Principal / owner", site: "Both", email: "principal@example.com" },
  { id: "s2", name: "Michelle Sample", role: "admin", title: "Office administrator", site: "Daycare", email: "office@example.com" },
  { id: "s3", name: "Busi Example", role: "staff", title: "Yellow Class teacher", site: "Daycare", email: "yellow@example.com" },
  { id: "s4", name: "Carla Demo", role: "staff", title: "Red Class teacher", site: "Daycare", email: "red@example.com" },
  { id: "s5", name: "Nandi Placeholder", role: "staff", title: "Grade R teacher", site: "Daycare", email: "grader@example.com" },
  { id: "s6", name: "Jason Test", role: "staff", title: "Aftercare supervisor", site: "Aftercare", email: "aftercare@example.com" },
];
