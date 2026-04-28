@AGENTS.md

# SMARTHIRE — non-negotiable rules

These rules apply to every Claude Code session in this repository. Do not
deviate without explicit user permission.

## 1. The design system is the source of truth

- Before writing **any** component, page, layout, color, font, spacing, or
  interaction, read [`design-system/smarthire/MASTER.md`](./design-system/smarthire/MASTER.md)
  AND any matching [`design-system/smarthire/pages/<page>.md`](./design-system/smarthire/pages/).
- If a page-level file does not exist yet, generate one with the skill's
  `--persist --page` flow before coding:
  ```bash
  python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<short page brief>" \
    --design-system --persist -p "SMARTHIRE" --page <page-name> --stack nextjs
  ```
  ⚠️ Do **not** regenerate `MASTER.md` itself — that file is brand-locked.
  Only page-level overrides are safe to regenerate.

## 2. No arbitrary values in components

- Every color must reference a CSS token defined in
  [`src/app/globals.css`](./src/app/globals.css) (e.g. `text-brand`,
  `bg-status-accepted`, `text-foreground`). No inline hex codes.
- Every spacing / radius / typography value must come from Tailwind tokens
  or the design system tokens. No magic numbers.
- The wordmark uses the dedicated [`Logo`](./src/components/brand/logo.tsx)
  component — do not re-implement it inline.

## 3. Latest stable versions

Use latest stable Next.js, Tailwind v4, shadcn/ui, and Supabase. Verify
against official docs when unsure.

## 4. TypeScript strict mode

- No `any`.
- No `@ts-ignore` without an inline reason comment.

## 5. Server Components by default

Add `"use client"` only when the component needs hooks, interactivity, or
browser APIs.

## 6. No emojis as icons

Always use [`lucide-react`](https://lucide.dev/icons/).

## 7. Verify before declaring done

Run, in order, and confirm all green:

```bash
npm run lint
npm run typecheck
npm run build
```

For UI work, also boot `npm run dev` and exercise the flow.

---

## Brand cue (do not forget)

The wordmark is **SMART**<span style="color:#DC2626">**H**</span>**I**<span style="color:#DC2626">**R**</span>**E** — letters black,
H and R in crimson `#DC2626`. This is the only place red appears as a logo
element. Outside the wordmark, crimson is reserved for primary CTAs and the
focus ring.
