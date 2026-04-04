# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with HMR
npm run build    # Production build (outputs to dist/)
npm run lint     # Run ESLint
npm run preview  # Preview production build locally
```

No test framework is configured.

## Architecture

**React 19 + Vite 8 SPA** — Hebrew RTL task management calendar app ("Taski"). ES modules throughout, plain JavaScript/JSX (no TypeScript).

**Entry:** `src/main.jsx` → `src/App.jsx` → `<AppProvider>` wraps everything.

### State Management

All global state lives in `src/context.jsx` (`AppContext` / `useApp` hook). Key state:
- `user`, `authLoading`, `dataLoading` — Supabase auth
- `tasks`, `projects` — loaded from Supabase, also cached in localStorage for stale-while-revalidate
- `theme` — `'soft' | 'happy' | 'night'`, persisted in localStorage, applies `data-theme` to `<html>`
- Modal state: `dailyView`, `addTaskModal`, `taskDetailId`, `projectViewId`, `addProjModal`, `statusFilter`, `editProjModal`, `deleteProjConfirm`
- `googleToken` — Supabase `provider_token` for Google Calendar API

**Stale-while-revalidate auth:** Synchronously reads Supabase session from localStorage on startup. If a valid cached session + cached data exists, renders immediately without a spinner, then silently refreshes in the background. `INITIAL_SESSION` event resolves auth in <50ms.

### Theming

`src/index.css` defines CSS custom properties on `:root` (Soft skin), `[data-theme="happy"]` (Happy skin), and `[data-theme="night"]` (Night mode). Tailwind v4 exposes all color classes as CSS variables (`--color-purple-*`, `--color-slate-*`) — overriding these in a theme block switches all Tailwind classes globally.

`src/utils.js` exports three project color helpers:
- `ps(color)` — pastel style (Soft skin)
- `psSolid(color)` — vibrant solid gradient (Happy skin)
- `psNight(color)` — dark charcoal + color border (Night skin)

Sidebar (`Sidebar.jsx`) selects the right helper based on `theme`.

### Routing

No router library. `App.jsx` checks `window.location.pathname` directly:
- `/privacy` → `<PrivacyPage />`
- `/terms` → `<TermsPage />`
- everything else → main app

`public/_redirects` handles Netlify SPA routing (`/* /index.html 200`).

### Modals

All modals use `src/components/modals/Backdrop.jsx` which centers content with `maxHeight: 90dvh` (keyboard-aware on iOS) and `flex flex-col`. Modal content areas use `flex-1 min-h-0 overflow-y-auto`. The `.modal-card` CSS class provides entry animation. `body.modal-open` locks scroll.

### Key Files

- `src/context.jsx` — all state, Supabase queries, task/project CRUD, Google Calendar integration
- `src/utils.js` — `ps()`, `psSolid()`, `psNight()`, `STATUS`, `STATUS_KEYS`, `friendlyDate()`
- `src/supabase.js` — Supabase client
- `src/components/modals/` — DailyModal, AddTaskModal, TaskDetailModal, ProjectModal, AddProjectModal, StatusTasksModal, EditProjectModal, DeleteConfirmModal
- `src/components/TimePicker.jsx` — drum-style time picker with pointer drag-to-scroll

### RTL Notes

`<html dir="rtl">` is set globally. Use `dir="ltr"` locally for elements that need LTR layout (nav arrows, toggle switches). iOS auto-zoom prevention: all inputs use `font-size: 16px` via `.input-field`.

### ESLint

Flat config format (`eslint.config.js`).
