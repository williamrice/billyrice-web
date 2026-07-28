# ADR 0002: Standardize on shadcn, Base UI, and Lucide

- Status: accepted
- Date: 2026-07-25

## Context

The application mixed local shadcn components, individual Radix primitives,
Headless UI, MUI, React Icons, Radix Icons, Heroicons, and Devicon. This created
overlapping APIs, duplicated dependencies, inconsistent visuals, and an
especially large Devicon asset payload.

The rebuild already uses React 19, Tailwind CSS 4, and owner-maintained local
components. Current shadcn defaults to stable Base UI primitives and Lucide.

## Decision

- Use current shadcn-generated local components backed by `@base-ui/react`.
- Use Tailwind CSS 4 and shadcn semantic theme tokens for styling.
- Use `lucide-react` for interface icons.
- Use Font Awesome Brands only for authentic company and social marks that
  Lucide intentionally excludes.
- Use Sonner for notifications and `tw-animate-css` for shared UI animations.
- Add only the shadcn components the application actively consumes.

## Consequences

- Radix, Headless UI, MUI, React Icons, Heroicons, and Devicon are not permitted
  dependencies without a superseding architectural decision.
- Base UI composition uses `render` rather than Radix's `asChild`.
- Local shadcn files remain application-owned and may be customized, but new
  primitives should be generated from the same Base UI style.
- Technology lists use lightweight text badges rather than decorative logos.
