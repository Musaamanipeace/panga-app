# UI / UX

Panga's visual language is dark, utilitarian, and animation-driven. This doc
describes what's implemented and where to find it in the code.

## Pages

- **Landing (`/`)** — dark login screen. Email → OTP → dashboard (see
  [`backend-features.md`](./backend-features.md#authentication) for the auth flow).
- **Dashboard (`/dashboard`)** — grid of project cards (progress, rename,
  delete) and a sliding "Add project" drawer.
- **Project view (`/project/:id`)** — tabbed workspace: Documentation, Tasks,
  Resources, Milestones, Issues, Reminders. Every list item can be created,
  edited, and deleted.

## Motion system

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

## Editing & deleting

Every savable entity (projects, tasks, doc sections, resources, resource
categories, milestones, issues, reminders) has both an inline rename/edit control
and a delete (✕ / 🗑) control next to it in its list. Deleting a project
cascades: its tasks, resources, docs, milestones, issues, and reminders go with it
(`data/projects.ts` → `deleteProject`).

## Design tokens

Color, spacing, and radius tokens live at the top of `src/index.css`
(`:root { --color-... }`). Change them there to re-theme the whole app.
