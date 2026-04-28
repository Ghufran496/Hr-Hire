# Landing Page Overrides

> **PROJECT:** SMARTHIRE
> **Page Type:** Landing / Marketing
> **Last verified against implementation:** 2026-04-28

> ⚠️ Rules in this file **override** the Master file (`design-system/smarthire/MASTER.md`).
> Only deviations from the Master are documented here. For everything else, follow the Master.

---

## Page-Specific Rules

### Layout

- **Max Width:** `max-w-6xl` (~1200px) container; matches the Master's container rule.
- **Layout:** Full-width background bands (alt `bg-secondary/30` between sections), centered content within the container.

### Section Order (canonical for `src/app/(public)/page.tsx`)

1. **Hero** — eyebrow chip + H1 (with the brand-crimson "Apply faster." accent) + subhead + primary brand CTA "Browse open roles" + outline secondary "HR sign in".
2. **Benefits** — exactly 3 benefit cards (`<Surface hoverable>`) with lucide icons.
3. **Latest open roles** — at most 3 `<JobCard>`s pulled from `fetchOpenJobs(3)`. Empty state when none. Includes a "View all jobs" link to `/jobs`.
4. **Footer** — provided by `(public)/layout.tsx` via `<SiteFooter>`.

### Spacing / Typography / Color

- No overrides — use the Master file.

### Anti-patterns (page-specific)

- ❌ No fade-in / parallax / CTA pulse / scroll-reveal animations.
  The Master file's "Excessive animation" anti-pattern wins over generic landing-page recommendations.
- ❌ No more than three benefit cards.
- ❌ No carousels or auto-rotating job feeds — the section is a static teaser.

### Effects

- Buttons + cards use the standard 150–200ms color/border/shadow transitions from the Master.

---

## Page-Specific Components

- `<Surface>` for the benefit cards.
- `<JobCard>` for the latest-jobs grid.

---

## Recommendations (already implemented)

- Hero CTA placement: center, large brand button.
- Touch: no horizontal swipe required on the main column.
- Responsive image sizing: not applicable — there are no images, just lucide icons.
