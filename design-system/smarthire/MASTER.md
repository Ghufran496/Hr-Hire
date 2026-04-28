# SMARTHIRE — Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/smarthire/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.
>
> **WARNING:** Do NOT regenerate this file with `search.py --design-system --persist`
> for SMARTHIRE — it will overwrite the brand-locked tokens. Page-level overrides
> (`--page <name>`) are safe.

---

**Project:** SMARTHIRE
**Category:** HR Recruitment / Applicant Tracking SaaS
**Brand cue:** Logo wordmark "SMARTHIRE" — letters in rich black, **H** and **R** in crimson red.

---

## Global Rules

### Color Palette (locked, brand-driven)

| Role           | Hex       | CSS Variable          | Usage                                           |
|----------------|-----------|-----------------------|-------------------------------------------------|
| Primary        | `#0A0A0A` | `--color-primary`     | Logo body, primary buttons, headings            |
| Brand Accent   | `#DC2626` | `--color-brand`       | "H" + "R" of logo, CTAs, status highlights      |
| Brand Hover    | `#B91C1C` | `--color-brand-hover` | Hover state for accent                          |
| Background     | `#FFFFFF` | `--color-background`  | Page background                                 |
| Surface        | `#F8FAFC` | `--color-secondary`   | Cards, table headers, muted sections            |
| Border         | `#E2E8F0` | `--color-border`      | Card/input borders, separators                  |
| Text Primary   | `#0A0A0A` | `--color-foreground`  | Body text, headings                             |
| Text Muted     | `#64748B` | `--color-muted-foreground` | Secondary text, captions                   |
| Destructive    | `#DC2626` | `--color-destructive` | Destructive actions, "Rejected" status          |

**Color Notes:** Strict 2-color brand identity (black + red on white). No blues, no gradients, no decorative colors. Status badges may borrow from the success/warning palette for the application workflow only.

### Application Status Color Mapping

| Status     | Token classes                                                            |
|------------|--------------------------------------------------------------------------|
| Applied    | `bg-status-applied text-status-applied-foreground`                       |
| Reviewing  | `bg-status-reviewing text-status-reviewing-foreground`                   |
| Interview  | `bg-status-interview text-status-interview-foreground`                   |
| Accepted   | `bg-status-accepted text-status-accepted-foreground`                     |
| Rejected   | `bg-status-rejected text-status-rejected-foreground`                     |

### Typography

- **Heading Font:** `Poppins` (weights 500, 600, 700) — `--font-heading`
- **Body Font:** `Inter` (weights 400, 500, 600, 700) — `--font-sans`
- **Mood:** modern, professional, clean, corporate, trustworthy
- Loaded via `next/font/google` in `src/app/layout.tsx`.

### Spacing & Layout

- Use Tailwind defaults: `p-4`/`gap-6`/`space-y-12` etc.
- Hero / landing sections: `py-20`–`py-28` desktop, `py-14`–`py-16` mobile.
- Page max width container: `max-w-6xl mx-auto px-4 sm:px-6`.

### Radius

`--radius: 0.625rem`. Pills (badges) use `rounded-full`. Cards use `rounded-xl`.

### Motion

- All interactive elements transition in **150–200ms ease**.
- Respect `prefers-reduced-motion` (already handled in `globals.css`).
- No layout-shifting hovers. Use color/opacity/border shifts only.

---

## Component Specs (use these classnames consistently)

### Buttons

- Primary (black): `bg-primary text-primary-foreground hover:bg-primary/90`
- Brand CTA (crimson): `bg-brand text-primary-foreground hover:bg-brand-hover`
- Outline: `border border-border bg-background text-foreground hover:bg-secondary`

### Cards

`bg-card border border-border rounded-xl p-6 transition hover:border-foreground/20 hover:shadow-md`

### Inputs

shadcn `<Input>` already wired to tokens. Focus ring uses `--ring` (= brand crimson).

### Status Badge

`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold` + status token classes.

---

## Style Guidelines

**Style:** Flat / Minimal Modern — 2D, minimalist, mono-chrome + single accent, clean lines, generous whitespace, typography-driven.

### Landing Page Pattern

1. Top nav (logo left, "Browse jobs" + "HR Login" right)
2. Hero — large headline, subhead, single brand CTA "Browse open roles"
3. Feature row (3 benefits, lucide icons)
4. Job listing teaser (latest 3 cards)
5. Footer (logo + minimal links)

### Dashboard Pattern

- Top header with logo, user menu, and primary actions; no sidebar in v1.
- Tables: hairline borders, surface-row header, clear status badges.
- Filter + search controls live above the table on a single row at ≥`md`, stacked below on mobile.

---

## Anti-Patterns (Do NOT Use)

- Emojis as icons — always `lucide-react`.
- Arbitrary hex codes — every color must reference a token from `globals.css`.
- Magic spacing — use Tailwind tokens.
- More than one accent color per screen besides brand crimson.
- Drop shadows on every element — reserve for floating surfaces.
- Layout-shifting hovers (`scale-110`, etc.).
- Mixed font families — only Poppins (heads) and Inter (body).
- Dark mode (out of scope for v1).
- Decorative gradients.

---

## Pre-Delivery Checklist

- [ ] No emojis used as icons (use lucide-react).
- [ ] All colors reference design tokens (no inline hex).
- [ ] All spacing/radius uses Tailwind tokens.
- [ ] `cursor-pointer` on all clickable elements.
- [ ] Hover states with smooth transitions (150–200ms).
- [ ] Light mode: text contrast 4.5:1 minimum.
- [ ] Focus states visible for keyboard navigation.
- [ ] `prefers-reduced-motion` respected.
- [ ] Responsive at 375px, 768px, 1024px, 1440px.
- [ ] No content hidden behind fixed navbars.
- [ ] No horizontal scroll on mobile.
- [ ] Status badges (not plain text) for application status everywhere.
- [ ] Forms use React Hook Form + Zod with field-level error states.
