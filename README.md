# Lil Angels – online registration (concept demo)

A clickable concept demo of online child registration for **Lil Angels Daycare and Aftercare Centre** (Tableview, Cape Town), built by Nostalgic Studio.

> **Concept demo – sample data only.** All 25 children, parents and staff are invented. Nothing typed into the demo leaves the browser.

- **Parent registration form** (`/register`): mobile-first and 8 steps, mirroring the paper Application Form. It has a progress bar, "save and continue later", a live monthly total and a confirmation screen with a registration number.
- **Staff dashboard** (`/staff`): a fake sign-in as Admin or Staff, overview cards, a **Children** page listing enrolled children only (by class, with allergies, who may collect and parents' numbers), a registrations table for applications (search, filters, sorting, status changes, CSV export), child profiles with five tabs, a printable one-page summary, and settings.

## Run it

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

| Page | URL |
| --- | --- |
| Start page | `/` |
| Parent form | `/register` |
| Staff sign in | `/staff/login` |
| Overview | `/staff` |
| Children (enrolled only) | `/staff/children` |
| Registrations (applications) | `/staff/registrations` |
| Child profile | `/staff/children/child-01` |
| Print summary | `/staff/children/child-01/print` |
| Settings | `/staff/settings` |

**Reset the demo:** sign in as Admin → Settings → *Reset demo data*. You can also clear the site's localStorage.

### Suggested walkthrough for the client

1. On a phone, open `/register`. Choose a programme and tick the sibling discount to watch the total change. Tap *Save*, leave, then come back to see the "Welcome back" message.
2. Finish the form. You can tick "I'm the only parent" to skip step 3. Note the registration number.
3. Click **Open in staff dashboard**. The new application is at the top of the overview.
4. Change its status from New to Waitlist, then to Accepted. Add a note. Click *Request missing documents*.
5. Use **Viewing as → Staff** in the sidebar to show what a teacher sees: health detail locked, documents unopenable, ID numbers "Admin only". Switch back to Admin and click *Reveal* on an ID. The reveal is recorded in the activity log.
6. Open **Children** for the day-to-day list of enrolled children. Filter by class or tick *Allergies / alerts only*, and tap a parent's number to call. Each child's profile opens with an *At a glance* panel: allergies, who may collect, parents' and emergency numbers.
7. Open *Print summary*, then the Registrations table → *Export CSV*.

## What's real and what's mocked

**Real:** the screens, the multi-step form with validation on every step, the fee calculation, the registration numbers, status changes, notes, the activity log, the role-based hiding of medical and document detail, ID masking with an audit entry on reveal, the print layout and the CSV export. All of these work against the sample data.

**Mocked:** there is no server, database or real login. Data lives in the browser's localStorage, so each device has its own copy. "Sign in" is a button. Uploaded files aren't stored; only the file name is kept. Emails ("copy sent", "missing documents requested") aren't sent and only show a message. The "save and continue later" draft is saved on the same device only.

## Project structure

```
app/
  page.tsx                       start page (parent / staff)
  register/page.tsx              parent form
  staff/login/page.tsx           fake sign in
  staff/(app)/…                  overview, children (enrolled), registrations, child profile, print, settings
components/
  register/                      wizard, step components, zod schemas, confirmation
  staff/                         shell, status select, masked value, restricted panel
  brand/                         logo wordmark, demo banner, initials avatar
  ui/                            shadcn-style primitives (button, input, card, tabs, dialog…)
lib/
  types.ts                       domain types (mirror the paper form)
  constants.ts                   centre details, programmes, prices, documents, illnesses
  seed.ts                        25 fake children (deterministic)
  data.ts                        data layer: getChildren(), getChild(), createRegistration()…
  role.tsx                       Admin / Staff role mock and permission matrix
```

**UI components:** they follow shadcn/ui conventions (`components/ui`, `cva` variants, `cn()` helper, lucide icons). They were written by hand because the shadcn CLI couldn't install packages on the build machine. The npm `allow-scripts` setting blocks it. They use native `<select>`, `<dialog>` and checkboxes, which behave best on phones and are fully keyboard accessible. You can swap in CLI-generated components later with `npx shadcn add …`.

**Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS 4, React Hook Form + Zod, lucide-react, sonner (toasts).

**Theme:** colours are sampled from lilangelsdaycare.co.za: lime `#93C524`, pink `#FF84BD`, orange `#FFB443`, blue `#60A6F4` and cream `#FFFCF1`. Fonts are Fredoka for headings and IBM Plex Sans for body text. For text and buttons, darker versions of the brand colours are used (`--brand-*-ink` in `app/globals.css`) so they meet WCAG AA contrast. The bright originals appear only as decoration or behind dark text. The logo is a stand-in wordmark; replace `components/brand/logo.tsx` with the real logo file before going live.

## Deploy to Vercel

1. Push the folder to a Git repository (GitHub, GitLab or Bitbucket).
2. In Vercel, choose **Add New → Project** and import the repo. It detects Next.js; keep the defaults.
3. Deploy. You don't need any environment variables for the demo.

You can also deploy from the CLI with `npx vercel` (preview) or `npx vercel --prod`. `output: "standalone"` is harmless on Vercel.

## Deploy to cPanel (Node.js hosting)

`next.config.ts` sets `output: "standalone"` and `images.unoptimized: true`, so the build is a self-contained Node server with no image-optimisation dependency.

1. Build locally (or in CI):
   ```bash
   npm ci
   npm run build:standalone
   ```
   This creates `.next/standalone/`, which contains `server.js`, a trimmed `node_modules`, `.next/static` and `public`.
2. Zip the **contents** of `.next/standalone/` (include the hidden `.next` folder) and upload them to a folder on the server, e.g. `~/lil-angels`.
3. In cPanel, open **Setup Node.js App → Create Application**:
   - Node.js version: 20 or newer
   - Application mode: Production
   - Application root: `lil-angels`
   - Application URL: your (sub)domain
   - Application startup file: `server.js`
4. Add the environment variable `HOSTNAME=0.0.0.0` if your host needs it. Passenger sets `PORT` itself.
5. Click **Start / Restart**. You don't need to run `npm install` on the server, because the standalone folder already includes its dependencies.

To update, rebuild, upload the new standalone contents and restart the app.

## From demo to production

The UI only talks to the async functions in `lib/data.ts` (`getChildren`, `getChild`, `createRegistration`, `updateStatus`, `addNote`, `setDocumentReceived`, `logActivity`, `getProgrammes`, `saveProgrammes`). Replace their bodies with Server Actions or route handlers and the pages don't need to change.

**Database: Neon Postgres**
- Suggested tables: `registrations`, `guardians`, `children`, `health_records` (kept apart from the rest, with tighter access), `emergency_contacts`, `collectors`, `documents` (metadata only), `notes`, `activity_log`, `staff_users`, `programmes`.
- Use Drizzle or Prisma for migrations. Keep `activity_log` append-only.
- Encrypt ID numbers and medical aid numbers at the column level (e.g. pgcrypto, or app-level encryption with a key in the hosting provider's secrets).
- Pick a Neon region and record it, because it affects POPIA cross-border transfer (see below). Turn on point-in-time restore.

**Staff login: Auth.js or Clerk**
- Turn the mock in `lib/role.tsx` into real roles (`admin`, `staff`) stored on the user. Enforce them **on the server** for every query, not just by hiding UI.
- Require two-factor authentication for admins. Use session timeouts on shared office computers.
- Parents don't need accounts. Use a signed, expiring magic link (emailed) for "save and continue later" and for uploading missing documents.

**Documents: private file storage**
- Use private object storage (Vercel Blob in private mode, Cloudflare R2, or S3 with server-side encryption). Never use public buckets.
- Upload straight from the browser using short-lived signed URLs; Vercel functions cap request bodies at about 4.5 MB. Limit file type and size (PDF and images, 10 MB) and virus-scan uploads.
- Staff view files through short-lived signed links that only admins can create, and each view is logged.

**Email: Resend**
- Confirmation email to parents with the registration number and payment reference.
- A "Request missing documents" email listing what's outstanding, with a secure upload link.
- Notify the office when a new application arrives. Verify the `lilangelsdaycare.co.za` domain (SPF/DKIM) so emails don't land in spam.

### POPIA notes (please read before production)

This system collects **children's personal information** and **special personal information** (health, religion). It needs a deliberate privacy design:

- **Question whether each field is necessary.** Ask the client to confirm why each of these is needed:
  - **Religion.** It is special personal information. It is optional in the demo; **remove it** unless there's a clear reason (e.g. a faith-based curriculum).
  - **Health data.** Keep what's needed for safe care and emergencies. Consider whether the full illness history is needed at *application* stage, or only after acceptance.
  - **ID numbers and ID documents.** Usually only needed for the enrolment contract and fee collection. Consider collecting them at enrolment, not application, so declined or waitlisted families never hand them over.
  - **HIV-positive / AIDS.** The paper form lists them, but they were **deliberately left out** of the demo. This information is highly sensitive, rarely needed for care and could expose the centre to discrimination claims. Don't add it back without legal advice.
- **Consent from a competent person.** Processing a child's information needs a parent's or guardian's consent (POPIA s35). The review step records consent and a timestamp.
- **Privacy notice.** The demo shows a short notice (what, why, who sees it, how long, how to ask for deletion). Have it reviewed and link a full privacy policy.
- **Need-to-know access.** Teachers see contact, allergy and emergency information only. Medical detail, documents and unmasked IDs are admin-only, and reveals are logged.
- **Retention.** Agree a schedule, e.g. delete declined or withdrawn applications after 12 months, and enrolled records X years after the child leaves. Automate it.
- **Information Officer.** The centre must register its Information Officer with the Information Regulator.
- **Operators.** Hosting, database, storage and email providers process data on the centre's behalf. Have operator agreements in place (s21), and document any transfer of data outside South Africa (s72).
- **Security and breaches.** Use encryption in transit and at rest, backups, an access log, and a documented breach-notification process (s22).
- **CSV export** is admin-only and deliberately leaves out ID numbers and health data.

## Things to confirm with Lil Angels

- **Daycare address:** the form says *44 South Road*; the website Contact page says *21 Fairway Road*. The demo uses the form.
- **Full Day inclusions:** the form lists none; the website says breakfast, cooked lunch and afternoon snack. The demo uses the form.
- **Age groups:** the demo uses Baby (under 1), Toddler (Yellow Class, 1–2½), Grade 00 (Red Class, 2½–4), Grade 0 (Green Class, 4–5), Grade R (5–6) and Aftercare. Ask whether babies under 1 are accepted, since the website says 1–6 years and the letterhead says "Baby".
- **Swimming lessons:** shown as R750 per term, separate from the monthly total. The sibling discount is applied to monthly fees only.
- **Application fee reference:** we suggest parents use the registration number as their payment reference.
