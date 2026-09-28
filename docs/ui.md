# Panga — Design System & UI Specification

## Design Principles

- **No emojis anywhere.** Status is conveyed through text labels and CSS-drawn shapes (squares, circles, bars).
- **Monospace, utilitarian type** — `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace`. No proportional or promotional text.
- **Motion is sliding only.** Pages and tabs slide horizontally; drawers and panels enter from their own edge; lists expand/collapse; buttons compress on click.
- **Every interactive element has a hover hint** (`data-tip`) explaining what it does.
- **Everything fits at any window size.** No fixed widths, no overflow, wrapping handled everywhere.
- **Every saved item can be renamed, edited, and deleted** — inline where possible, via drawer for confirmations.

## Layout

```
.app-shell
  ├── .app-header (sticky, z-index 40)
  │     ├── .app-logo → /home
  │     ├── <GlobalSearch />  (Ctrl+K trigger)
  │     ├── spacer
  │     ├── Settings link
  │     └── Logout button
  ├── .app-main
  │     └── <Outlet />  (page content)
  └── <AssistantPanel />  (fixed FAB + sliding panel)
```

### Page frame

```css
.page {
  width: 100%;
  max-width: 1180px;   /* caps line length, never pins fixed size */
  margin: 0 auto;
  padding: 16px 12px 64px;
  min-width: 0;        /* allows children to shrink */
}
```

All long content (titles, URLs, notes) uses `min-width: 0; overflow-wrap: anywhere; word-break: break-word;` so nothing forces horizontal scroll.

## Motion

### Page / tab sliding

```css
.slide-stage { display: flex; overflow: hidden; }
.slide-track { display: flex; width: 100%; }
.slide-panel { flex: 0 0 100%; min-width: 0; }

.slide-panel-enter-right { animation: slideInFromRight 220ms cubic-bezier(0.22,0.61,0.36,1) both; }
.slide-panel-enter-left  { animation: slideInFromLeft  220ms cubic-bezier(0.22,0.61,0.36,1) both; }
```

Changing a `slideKey` on the panel triggers the animation. Direction is derived from the previous vs current order index.

### Drawer sliding

```css
.drawer-backdrop-right .drawer-panel { animation: slideInFromEdgeRight 220ms ... both; }
.drawer-backdrop-left  .drawer-panel { animation: slideInFromEdgeLeft  220ms ... both; }
.drawer-backdrop-bottom .drawer-panel { animation: slideInFromBottom 220ms ... both; }
```

### List expand/collapse

```css
.collapsible { overflow: hidden; animation: collapse 220ms ... both; }
@keyframes collapse { from { max-height: 0; opacity: 0; } to { max-height: 900px; opacity: 1; } }
```

### Button press

All buttons compress: `transform: scale(0.94)` on `:active`.

### Reduced motion

All animations/transitions disabled when `prefers-reduced-motion: reduce`.

## Colour palette (CSS custom properties)

```css
:root {
  --bg: #ffffff;
  --bg-subtle: #f6f7f8;
  --bg-inset: #eef0f2;
  --text: #14171a;
  --text-muted: #5f676f;
  --text-faint: #868e96;
  --border: #d8dce0;
  --border-strong: #b4bbc2;

  --accent: #1f5fd0;
  --accent-soft: #e8effb;
  --task: #1f5fd0;
  --resource: #17794a;
  --milestone: #a2600a;
  --issue: #b3261e;
  --secret: #6b3fa0;
  --ai: #7a3fb8;
}
```

Semantic colours are used consistently:
- Task = blue (`--task`)
- Resource = green (`--resource`)
- Milestone = amber (`--milestone`)
- Issue = red (`--issue`)
- Secret = purple (`--secret`)
- AI = violet (`--ai`)

## Hover hints

Every interactive element carries `data-tip="…"`. The hint is rendered with CSS:

```css
[data-tip]::after {
  content: attr(data-tip);
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%) translateY(3px);
  max-width: min(260px, 78vw);
  background: #14171a;
  color: #fff;
  padding: 5px 8px;
  border-radius: 4px;
  font-size: 11px;
  opacity: 0;
  transition: opacity 140ms, transform 140ms;
}
[data-tip]:hover::after,
[data-tip]:focus-visible::after { opacity: 1; transform: translateX(-50%) translateY(0); }
```

Hints near the right edge use `data-tip-edge="left"` to flip positioning.

## Component primitives

### Button variants

| Class | Use |
|-------|-----|
| `.btn-primary` | Primary action (blue) |
| `.btn-secondary` | Secondary/neutral |
| `.btn-danger` | Destructive (red) |
| `.btn-icon` | Icon/text only, no bg |
| `.btn-small` | Compact size |

### Status marks (CSS shapes, never emoji)

```css
.mark { width: 14px; height: 14px; border: 1px solid; border-radius: 3px; }
.mark-active     { border-color: var(--task); background: var(--task); }
.mark-inactive   { border-style: dashed; }
.mark-completed  { border-color: var(--resource); background: var(--resource); }
.mark-completed::after { content:""; position:absolute; left:3px; top:0; width:6px; height:10px; border:solid #fff; border-width:0 2px 2px 0; transform:rotate(42deg); }
```

Severity marks (three bars, low→high):
```css
.mark-severity { width:16px; height:12px; background: linear-gradient(currentColor 0 0) 0 100%/3px 4px no-repeat, ...; }
.mark-severity-low    { color: var(--border-strong); }
.mark-severity-medium { color: var(--milestone); }
.mark-severity-high   { color: var(--issue); }
```

### Chips

```css
.chip { padding: 4px 10px; border: 1px solid var(--border); border-radius: 999px; font-size: 12px; color: var(--text-muted); }
.chip-active { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); font-weight: 700; }
```

### List items (grid)

```css
.item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: 10px;
  padding: 10px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-left: 3px solid var(--border-strong);
}
.item-body { min-width: 0; }
@media (max-width: 560px) { .item { grid-template-columns: minmax(0, 1fr); } }
```

### Form fields

All inputs/textarea/select use consistent styling:
```css
input, textarea, select {
  width: 100%; min-width: 0;
  padding: 7px 9px;
  background: var(--bg);
  border: 1px solid var(--border-strong);
  border-radius: 4px;
  font-size: 13px;
}
```

Inline forms wrap:
```css
.inline-form { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.inline-form > input { flex: 1 1 180px; }
```

### Search palette

`Ctrl/Cmd+K` opens a centred modal with:
- Input field
- Grouped results (type label + items)
- Keyboard navigation (↑/↓, Enter, Esc)
- Each item has `data-tip` hint

### Assistant panel

Fixed FAB (bottom-right) → sliding drawer from right:
- Tabs: History (list) / Chat
- Messages slide in from bottom
- Clarification box slides up from composer
- Approval box slides up for agent actions

## Landing page

- Monospace mark `P` in a bordered square
- `h1` in uppercase, letter-spaced
- Login form slides in from right
- Dev-mode OTP shown inline (no email service needed)
- No page-load transition, no glint

## Settings page

Tab bar across sections:
1. General — account, database reopen
2. Gemini API — key input
3. Google Calendar — OAuth client ID, connect/disconnect, sync
4. Google Drive — Picker API key, folder picker
5. Subcategories — managed inside Resources tab
6. Vault — passphrase create/unlock/lock
7. Assistant — retention days, prune button
8. Sync — Supabase status, sync button
9. Danger — wipe local DB

## Responsive breakpoints

| Width | Adjustments |
|-------|-------------|
| > 1180px | Page centred at max-width |
| ≤ 1180px | Page full-width, padding 12px |
| ≤ 760px | Tab bar scrolls, chips wrap, grid stacks |
| ≤ 560px | Item grid becomes single column, drawers full-width, tab labels may abbreviate |

No horizontal scrollbar ever appears.

## Accessibility

- All interactive elements reachable by keyboard
- Focus visible: `outline: 2px solid var(--accent); outline-offset: 2px;`
- ARIA labels on icon-only buttons
- `aria-expanded` on disclosures
- `aria-current` on active tabs
- `role="dialog" aria-modal="true"` on drawers/palette
- `prefers-reduced-motion` respected

## Dark mode (future)

CSS variables structured for easy dark mode override — swap `--bg`, `--text`, `--border`, etc.

---

_This document reflects the implementation as of the merged plan. Update when design changes._