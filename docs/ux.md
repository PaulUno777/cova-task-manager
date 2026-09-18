# UX and design system

## Visual direction

The interface follows the COVA recruitment material: professional, clear, and product-like—not a bare technical demo.

## Color tokens

These values are the **source of truth**. Frontend CSS variables in `frontend/src/index.css` should match them.

| Role | Token | Hex | Usage |
| --- | --- | --- | --- |
| Primary (teal) | `cova-teal` | `#0D9488` | Primary buttons, links, focus ring |
| Primary dark | `cova-teal-dark` | `#0F766E` | Hover states |
| Accent (orange) | `cova-accent` | `#EA580C` | Key CTAs, highlights |
| Accent light | `cova-accent-light` | `#FB923C` | Soft accent backgrounds |
| Background | `background` | `#FFFFFF` | Page background |
| Foreground | `foreground` | `#0F172A` | Headings, body text |
| Muted text | `muted-foreground` | `#64748B` | Secondary copy |
| Border | `border` | `#E2E8F0` | Dividers, inputs |
| Surface muted | `cova-neutral-50` | `#F8FAFC` | Footer, subtle panels |

shadcn/ui semantic tokens (`primary`, `accent`, etc.) map to these colors in the app stylesheet.

## Typography and spacing

- Font: system stack with Inter preferred where loaded; sans-serif fallback.
- Headings: semibold, tight tracking on hero titles.
- Layout max width: `max-w-6xl` for main content; generous horizontal padding on small screens.

## Application shell (Phase 1)

- Header: wordmark, placeholder nav (disabled until auth exists).
- Main: hero message and three short cards explaining the design system.
- Footer: assessment attribution.

## Required UI states (as features ship)

Every async flow should handle:

| State | Expectation |
| --- | --- |
| Loading | Skeleton or spinner; disable destructive actions |
| Empty | Message + primary CTA (e.g. create first task) |
| Error | Clear message + retry when applicable |
| Success | Updated list or toast feedback |

## Responsive behavior

- Mobile-first Tailwind utilities.
- Header wraps nav on narrow viewports.
- Task lists and forms remain usable at ~320px width.

## Accessibility

- Semantic HTML (`header`, `main`, `footer`, `nav`, `button`).
- Visible focus rings (`ring` uses primary teal).
- Do not rely on color alone for task status (labels/icons when tasks exist).

## Out of scope for Phase 1

Login/register screens, task cards, toasts, and TanStack Query-driven views are implemented in later phases.
