# UI / UX

Panga's visual language is utilitarian, monospace, and animation-driven. This doc describes what's implemented and where to find it in the code.

## Pages

- **Landing (`/`)** — Dark login screen. Email → OTP → dashboard (see [`backend-features.md`](./backend-features.md#authentication) for the auth flow).
- **Dashboard (`/dashboard`)** — Home screen with:
  - **Alerts** (computed, not stored): overdue tasks, due/overdue reminders, missed milestones. Clickable deep-links.
  - **Summary row**: Active tasks count, total tasks count, milestones progress %, project count. Each card is clickable and deep-links.
  - **Add Project** drawer (slide-in from right).
  - **Project grid** (existing cards with progress, rename, delete).
- **Project view (`/project/:id`)** — Tabbed workspace: Documentation, Tasks, Scheduler, Resources, Milestones, Calendar, Issues, Reminders. Every list item can be created, edited, and deleted.
- **Settings (`/settings`)** — Gemini API key, Google Calendar OAuth connection, Secrets vault management.

## Motion System

| Interaction | Behavior | Where |
| --- | --- | --- |
| Route change | "Machete cut": diagonal metallic stroke (0.25s) then the old screen splits and slides off in two triangular halves (0.35s) | `components/MacheteTransition.tsx` |
| Login → dashboard | Same machete cut, played manually after OTP verifies | `playMacheteCut()` in `MacheteTransition.tsx` |
| Hover tooltips | Every interactive element carries a `data-tip` attribute; a 150ms-delayed, monospaced, solid dark-slate tooltip renders via pure CSS | `index.css` → `[data-tip]` rules |
| Click feedback | All buttons/cards compress to `scale(0.97)` on `:active` | `index.css` → `.clickable` rules |
| Dropdowns / expandable cards | Scale-and-fade from `translateY(-8px) scaleY(0.95)` | `.dropdown-anim` |
| Side drawers | Slide in from the right (`translateX(100%) → 0`) | `.drawer-panel` / `.drawer-anim` (Add-project drawer, AI panel) |
| Global search | Central overlay scale-expands open; result rows slide 6px right on hover | `components/GlobalSearch.tsx` + `.search-panel-open` |
| Login button | Diagonal "blade glint" sweep on hover | `.blade-glint` |
| Resource cards | Lift on hover (`translateY(-2px)`) | `.resource-item:hover` |
| Link resources | Hover shows a diagonal arrow offset | `.resource-value-link:hover` |
| Image resources | Thumbnail scales to 1.05 on hover | `.resource-image-thumb:hover` |
| Milestone / progress bars | Hovering shows exact `%` complete and pending task count | `components/ProgressBar.tsx` |
| Milestone nodes | Hovering a milestone reveals its full list of blocking tasks and their status | `pages/ProjectView.tsx` → `MilestonesTab` |
| Scheduler AI prompt box | Slides up from bottom when AI mode is selected | `.sliding-prompt-box` |

## Editing & Deleting

Every savable entity (projects, tasks, doc sections, resources, milestones, issues, reminders, schedule items, calendar events, secrets) has both an inline rename/edit control and a delete (`×`) control next to it in its list. Deleting a project cascades: its tasks, resources, docs, milestones, issues, reminders, calendar events, and schedule items go with it (`data/projects.ts` → `deleteProject`).

## Design Tokens

Color, spacing, and radius tokens live at the top of `src/index.css` (`:root { --color-... }`). Change them there to re-theme the whole app.

## Icon / Glyph System

All emoji glyphs have been removed. Interactive elements use text labels (`Edit`, `Del`, `MIC`, `REC`, `AI`, `Done`, `o`) or CSS-drawn shapes (checkmarks via border, close via `×` multiplication sign). The landing mark uses a single letter `P` in the app's monospace type treatment.