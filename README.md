# Plansmith Retention

A clickable PM-facing churn-intervention console for a B2B project management SaaS.

> See [`PRD.md`](./PRD.md) for the product brief, hypothesis, and validation criteria, and [`PROMPTS.md`](./PROMPTS.md) for the build iterations.

---

## The Flow

```
┌─ AppShell (sidebar nav, persistent on every screen)
│
├── /                       At-Risk Queue          ← primary workspace
│       ↓ click account
│       Account Detail Panel (right side)
│       ↓ Send intervention (700ms async, 12% simulated failure)
│   ┌── success ───────────────────────────────┐
│   │   ↓                                       │
│   │  /confirmation/:entryId                   │
│   │  Intervention Confirmation                │
│   │   ↓ "Next at-risk: {team}"                │
│   └─→ back to /                               │
│   failure → inline error banner (Retry / Choose another action)
│
├── /snoozed     Snoozed Accounts (countdown + Resume)
├── /history     Intervention History (filterable audit log)
└── /all-clear   All Clear (empty / inbox-zero state)
```

Operator: **Jordan Kim, PM · Growth** (single hardcoded user).

---

## Project Structure

The codebase is grouped by **feature**, with a thin app shell on the outside. Data logic and display components are kept separate so screens stay readable.

```
src/
├── App.tsx                       # router + providers
├── main.tsx                      # entry
├── index.css                     # design tokens (HSL semantic)
│
├── layout/                       # cross-feature layout primitives
│   ├── AppShell.tsx              # persistent sidebar wrapper
│   └── NavLink.tsx               # router NavLink with activeClassName
│
├── features/
│   └── retention/                # everything churn-intervention lives here
│       ├── index.ts              # public API (provider, pages, types)
│       │
│       ├── data/                 # ── DATA LAYER ─────────────────────
│       │   ├── types.ts          # Account, Action, LogEntry, ...
│       │   └── accounts.ts       # mock seed of 5 at-risk accounts
│       │
│       ├── state/                # ── STATE LAYER ────────────────────
│       │   └── RetentionContext.tsx   # intervened/snoozed/logs + intervene() stub
│       │
│       ├── hooks/                # ── DERIVED DATA / SIDE EFFECTS ────
│       │   ├── useAccountQueue.ts     # filter, sort, counts, next-at-risk
│       │   ├── useDetailLoading.ts    # 500ms skeleton trigger on selection
│       │   └── useNow.ts              # ticking clock for snooze countdown
│       │
│       ├── utils/                # ── PURE HELPERS ───────────────────
│       │   ├── time.ts                # formatRelative, formatTimestamp, timeRemaining
│       │   └── channels.ts            # channel → icon lookup
│       │
│       ├── components/           # ── DISPLAY COMPONENTS ─────────────
│       │   ├── RiskBadge.tsx          # badge + score ring
│       │   ├── AccountRow.tsx         # one row in the queue
│       │   ├── AccountDetailPanel.tsx # the main right-hand panel
│       │   └── AccountDetailPanelSkeleton.tsx
│       │
│       └── pages/                # ── ROUTE-LEVEL SCREENS ────────────
│           ├── AtRiskQueuePage.tsx
│           ├── InterventionConfirmationPage.tsx
│           ├── SnoozedAccountsPage.tsx
│           ├── AllClearPage.tsx
│           └── InterventionHistoryPage.tsx
│
├── components/ui/                # shadcn/ui primitives (unchanged)
├── pages/NotFound.tsx            # global 404
├── lib/utils.ts                  # cn() helper
└── hooks/                        # generic hooks (use-mobile, use-toast)
```

### Layering rules

- **`data/`** — types and mock fixtures only. No React.
- **`state/`** — single React context + the `intervene()` stub (async, simulated latency, simulated failure rate).
- **`hooks/`** — derived data (filter/sort/count) and side effects (tickers, loading flags). Pages call hooks; components don't.
- **`utils/`** — pure functions, no React, no state.
- **`components/`** — presentation only. Receive props, render JSX. No `useRetention()` calls.
- **`pages/`** — wire context + hooks → components. The only place data and display meet.

### Naming map (rename log)

| Old name | New name | Location |
|---|---|---|
| `pages/Index.tsx` | **At-Risk Queue** → `AtRiskQueuePage.tsx` | `features/retention/pages/` |
| `components/AccountDetail.tsx` | **Account Detail Panel** → `AccountDetailPanel.tsx` | `features/retention/components/` |
| `components/AccountDetailSkeleton.tsx` | `AccountDetailPanelSkeleton.tsx` | `features/retention/components/` |
| `pages/Confirmation.tsx` | **Intervention Confirmation** → `InterventionConfirmationPage.tsx` | `features/retention/pages/` |
| `pages/Snoozed.tsx` | **Snoozed Accounts** → `SnoozedAccountsPage.tsx` | `features/retention/pages/` |
| `pages/AllClear.tsx` | **All Clear** → `AllClearPage.tsx` | `features/retention/pages/` |
| `pages/History.tsx` | **Intervention History** → `InterventionHistoryPage.tsx` | `features/retention/pages/` |

Pages are now imported from a single barrel: `@/features/retention`.

---

## Tech Stack

React 18 · TypeScript · Vite 5 · Tailwind v3 · shadcn/ui · React Router · Sonner · Lucide.

No backend. State is in-memory and resets on reload.

## Run locally

```bash
bun install
bun run dev
```
