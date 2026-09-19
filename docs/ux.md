# UX and design system

## Visual direction

The interface follows the COVA recruitment material: professional, clear, and product-like not a bare technical demo.

## Color tokens

These values are the **source of truth**. Frontend CSS variables in `frontend/src/index.css` should match them.


| Role            | Token               | Hex       | Usage                              |
| --------------- | ------------------- | --------- | ---------------------------------- |
| Primary (teal)  | `cova-teal`         | `#0D9488` | Primary buttons, links, focus ring |
| Primary dark    | `cova-teal-dark`    | `#0F766E` | Hover states                       |
| Accent (orange) | `cova-accent`       | `#EA580C` | Key CTAs, highlights               |
| Accent light    | `cova-accent-light` | `#FB923C` | Soft accent backgrounds            |
| Background      | `background`        | `#FFFFFF` | Page background                    |
| Foreground      | `foreground`        | `#0F172A` | Headings, body text                |
| Muted text      | `muted-foreground`  | `#64748B` | Secondary copy                     |
| Border          | `border`            | `#E2E8F0` | Dividers, inputs                   |
| Surface muted   | `cova-neutral-50`   | `#F8FAFC` | Footer, subtle panels              |


shadcn/ui semantic tokens (`primary`, `accent`, etc.) map to these colors in the app stylesheet.

## Typography and spacing

- Font: system stack with Inter preferred where loaded; sans-serif fallback.
- Headings: semibold, tight tracking on hero titles.
- Layout max width: `max-w-6xl` for main content; generous horizontal padding on small screens.



## Application shell

- Header: wordmark (links home), sticky on scroll, language selector (globe + flag, dropdown), and  auth-aware either Sign in/Get started buttons or an avatar (initial letter) dropdown showing email, member-since date, and logout.
- Main (`/`, logged out): hero message and three cards on real capabilities (security, exploring the API, the task workflow)  not design-system trivia.
- Main (`/`, logged in): the task dashboard.
- Footer: assessment attribution.



## Task dashboard

- Kanban board: three columns (To do / In progress / Done), each with a soft tint reusing
the COVA palette (neutral / accent-orange / primary-teal), not arbitrary colors.
- Cards are draggable between columns (changes status), clickable (opens a read-only detail
dialog with full description + timestamps), and have inline edit/delete icon buttons.
- Search (debounced, 2+ characters) and a status filter that collapses the board to a single column when active the columns themselves are the "all statuses" view.



## Required UI states

Every async flow handles:


| State   | Expectation                                      | Implemented as                      |
| ------- | ------------------------------------------------ | ----------------------------------- |
| Loading | Skeleton or spinner; disable destructive actions | Column-shaped `Skeleton` blocks     |
| Empty   | Message + primary CTA (e.g. create first task)   | Dashed-border panel + CTA button    |
| Error   | Clear message + retry when applicable            | `Alert` + retry button              |
| Success | Updated list or toast feedback                   | Query invalidation + `sonner` toast |




## Responsive behavior

- Mobile-first Tailwind utilities.
- Header wraps nav on narrow viewports.
- Task lists and forms remain usable at ~320px width.



## Internationalization

- EN/FR, switchable from the header globe/flag selector; choice persisted in `localStorage`,
defaulting to the browser's language on first visit.
- Hand-rolled (context + dictionary, no i18next) see `[docs/decisions.md](decisions.md#hand-rolled-i18n-no-i18next)`.



## PWA

- Installable (manifest + service worker via `vite-plugin-pwa`); a dismissible banner listens
for `beforeinstallprompt` and offers "Add to Home Screen" on Android/desktop Chrome. iOS
Safari doesn't support that event (platform limitation) — users there add it manually via
Share → Add to Home Screen.



## Accessibility

- Semantic HTML (`header`, `main`, `footer`, `nav`, `button`).
- Visible focus rings (`ring` uses primary teal).
- Do not rely on color alone for task status every status also has a text label (badge).
- Task cards are keyboard-operable (`tabIndex`, Enter/Space activates), icon-only buttons
(edit/delete/drag) all have `aria-label`s.

