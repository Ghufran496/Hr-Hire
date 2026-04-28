# SMARTHIRE — HR Recruitment / Applicant Tracking

A modern Next.js + Supabase applicant tracking app. Candidates browse open
roles and apply with a PDF CV; HR admins log in to a protected dashboard to
review applicants, change status, and leave internal notes. Status changes
trigger transactional emails to candidates via Resend.

---

## Tech stack

- **Framework:** Next.js 16 (App Router, TypeScript, Turbopack, server actions)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`)
- **Components:** shadcn/ui (radix-nova preset)
- **Backend:** Supabase (`@supabase/supabase-js` + `@supabase/ssr`) — PostgreSQL, auth, private storage
- **Email:** Resend (transactional, optional — gracefully no-ops without an API key)
- **URL state:** nuqs
- **Forms + validation:** React Hook Form + Zod (client) + Zod re-validation in server actions
- **Icons:** lucide-react
- **Toasts:** Sonner
- **Quality:** ESLint, Prettier (+ `prettier-plugin-tailwindcss`), Husky, lint-staged

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Provision a Supabase project

1. Create a new project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run [`supabase/schema.sql`](./supabase/schema.sql) end-to-end.
   This creates the tables, the **private** `cvs` storage bucket, RLS policies,
   the trusted `is_admin()` helper, and the trigger that mirrors `auth.users`
   into `public.users`.
3. **Disable public sign-ups** at _Authentication → Providers → Email_ (uncheck
   "Enable Sign Ups"). HR users are seeded manually below; candidates apply
   without an account.
4. Create the seed HR admin:
   - _Authentication → Users → Add user_ with email + password.
   - In the Supabase **SQL editor**, run:
     ```sql
     update public.users set role = 'admin' where email = 'hr@smarthire.example';
     ```
     The role lives in `public.users.role` — that is the only trusted source for
     the admin check. Setting `role` in user metadata does **not** elevate.

### 3. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-ROLE-KEY     # server-only, NEVER prefix with NEXT_PUBLIC_
SUPABASE_PROJECT_ID=YOUR-PROJECT-ID

# Optional during dev — required in prod for email to send.
RESEND_API_KEY=
RESEND_FROM_EMAIL="SMARTHIRE <onboarding@resend.dev>"
```

The service-role key is required: server actions (application submit,
status update, signed CV URLs, comments, jobs) use it to bypass RLS while
re-validating input server-side. Never expose it to the browser.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Script                 | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| `npm run dev`          | Dev server (Turbopack)                               |
| `npm run build`        | Production build                                     |
| `npm run start`        | Run the built app                                    |
| `npm run lint`         | ESLint                                               |
| `npm run lint:fix`     | ESLint with auto-fix                                 |
| `npm run format`       | Prettier write                                       |
| `npm run format:check` | Prettier check (CI)                                  |
| `npm run typecheck`    | `tsc --noEmit`                                       |
| `npm run db:types`     | Regenerate `src/lib/supabase/types.ts` from Supabase |

A pre-commit hook runs ESLint (auto-fix) + Prettier on staged files via
Husky + lint-staged.

---

## Folder structure

```
src/
├── app/
│   ├── (public)/                         # candidate-facing pages
│   │   ├── layout.tsx                    # site header + footer
│   │   ├── page.tsx                      # landing
│   │   ├── error.tsx                     # error boundary
│   │   └── jobs/
│   │       ├── page.tsx                  # /jobs — open roles list
│   │       ├── loading.tsx               # skeleton
│   │       └── [id]/
│   │           ├── page.tsx              # /jobs/[id] — job details
│   │           └── apply/
│   │               ├── page.tsx          # /jobs/[id]/apply
│   │               └── application-form.tsx
│   ├── hr/
│   │   ├── login/                        # /hr/login (public)
│   │   ├── (authed)/                     # admin-only route group
│   │   │   ├── layout.tsx                # requireAdmin() role guard
│   │   │   ├── error.tsx
│   │   │   ├── not-found.tsx
│   │   │   ├── dashboard/                # /hr/dashboard
│   │   │   ├── jobs/                     # /hr/jobs
│   │   │   └── applications/[id]/        # /hr/applications/[id]
│   │   └── page.tsx                      # /hr → redirect
│   ├── globals.css                       # design tokens
│   ├── layout.tsx                        # root layout, fonts, providers
│   ├── not-found.tsx                     # public 404
│   └── global-error.tsx                  # last-resort root error boundary
├── components/
│   ├── brand/                            # SMARTHIRE wordmark, header, footer, JobCard, StatusBadge, Surface, page-skeletons
│   ├── hr/                               # HR-area UI
│   └── ui/                               # shadcn/ui primitives (do not edit)
├── lib/
│   ├── supabase/                         # browser/server clients, service-role admin, middleware, types
│   ├── actions/                          # server actions: applications, comments, jobs, auth (role lookup)
│   ├── email/                            # Resend wrapper + status-change templates
│   ├── validation/                       # Zod schemas
│   ├── auth.ts                           # getCurrentUser / requireAdmin
│   ├── format.ts                         # date helpers
│   ├── jobs.ts                           # server-side job fetchers
│   └── utils.ts                          # `cn`
├── providers/                            # NuqsAdapter + Toaster
├── hooks/                                # (custom hooks)
└── proxy.ts                              # Supabase session refresh + auth gate
```

---

## Pages

| Route                   | Purpose                                                                |
| ----------------------- | ---------------------------------------------------------------------- |
| `/`                     | Landing — hero, benefits, latest jobs                                  |
| `/jobs`                 | Public listing of all open roles                                       |
| `/jobs/[id]`            | Full job description + Apply CTA                                       |
| `/jobs/[id]/apply`      | Candidate form — submits via server action with PDF upload             |
| `/hr/login`             | HR sign-in (admin-only; non-admins get a generic error)                |
| `/hr/dashboard`         | Sortable, searchable, status-filterable applicant table                |
| `/hr/applications/[id]` | Application + signed-URL CV preview + status updater + comments thread |
| `/hr/jobs`              | HR posting management (create / open-close)                            |

---

## Application status workflow

`Applied → Reviewing → Interview → Accepted | Rejected`

Each status has its own colour token (`--color-status-*`). Status badges are
the only acceptable representation of status — never plain text.

When status changes, an email is sent to the candidate via Resend (skipped
silently if `RESEND_API_KEY` is missing).

---

## Security model (read this before touching auth)

- **`public.users.role` is the ONLY trusted source for "is this user an admin?"**.
  Never read role from `user.user_metadata` — that field is user-modifiable
  via `auth.updateUser({ data: { role: 'admin' } })`.
- The signup trigger always writes `role: 'candidate'`, ignoring the payload.
- The proxy at [`src/proxy.ts`](./src/proxy.ts) only checks "is the user logged in".
  The actual role check lives in [`src/app/hr/(authed)/layout.tsx`](<./src/app/hr/(authed)/layout.tsx>)
  via `requireAdmin()` from [`src/lib/auth.ts`](./src/lib/auth.ts).
- The CV bucket is **private**. HR previews fetch a 10-minute signed URL via
  [`getSignedCvUrlAction`](./src/lib/actions/applications.ts).
- Public application submission goes through
  [`submitApplicationAction`](./src/lib/actions/applications.ts) using the
  service-role key. The action re-validates the Zod schema, confirms the
  job is open, uploads the CV, then inserts the row with `status: 'applied'`.

---

## Design system

> **Single source of truth:** [`design-system/smarthire/MASTER.md`](./design-system/smarthire/MASTER.md).
> Page-level overrides live under `design-system/smarthire/pages/`.

Every UI task in this repo must start by reading `MASTER.md`. Brand palette
(rich black `#0A0A0A` + crimson `#DC2626` on white), typography (Poppins
headings + Inter body), spacing, radius, and status colours are all locked
to design tokens defined in [`src/app/globals.css`](./src/app/globals.css).
Do not introduce arbitrary hex codes or magic spacing — everything ties back
to a token.

The brand wordmark is rendered inline in
[`src/components/brand/logo.tsx`](./src/components/brand/logo.tsx) — black
"SMART…I…E" with crimson "H" and "R", per the client brief.

A pre-delivery checklist is appended to `MASTER.md`. Run through it before
calling any UI task done.

---

## Deployment

Push to GitHub, import to [Vercel](https://vercel.com), and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` _(server-side only)_
- `RESEND_API_KEY` _(optional but required for emails)_
- `RESEND_FROM_EMAIL`

The proxy keeps Supabase sessions in sync on every request.
