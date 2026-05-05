# Engineering Handoff

A retention-ops prototype: surfaces at-risk accounts, recommends an intervention, lets a CSM send it (or snooze), and logs the outcome. Everything is client-side with mocked data.

---

## Start Here

**You're an engineer picking this up. Read in this order:**

1. **`PRD.md`** — what we're building and why.
2. **`PROMPTS.md`** — design intent behind the three core flows.
3. **`README.md`** — folder layout + flow diagram.
4. **`src/features/retention/data/types.ts`** — the entire domain model lives here. Read it first; everything else makes sense after.
5. **`src/features/retention/data/accounts.ts`** — the seed data. This is what a real API will eventually return.
6. **`src/features/retention/state/RetentionContext.tsx`** — the only stateful module. All mutations go through it. **This is the file to replace when wiring a real backend.**
7. **`src/features/retention/pages/AtRiskQueuePage.tsx`** — the main screen; follow the data from context → row → detail panel → confirmation.

**Where to begin work:** swap `RetentionContext` from in-memory state to API calls. The Promise-based `intervene()` signature was deliberately chosen so this swap is local — no page or component changes required. Types stay identical.

---

## Project Structure

```
src/
├── features/retention/      ← all product code
│   ├── data/                ← types + seed data (the "API surface")
│   ├── state/               ← RetentionContext (single source of truth)
│   ├── hooks/               ← reusable stateful logic
│   ├── utils/               ← pure helpers (formatting, channel meta)
│   ├── components/          ← presentational pieces
│   ├── pages/               ← one file per route/screen
│   └── index.ts             ← barrel export
├── layout/                  ← AppShell, NavLink (chrome, not feature code)
├── components/ui/           ← shadcn primitives — do not edit
├── pages/                   ← NotFound (router fallback only)
├── App.tsx                  ← routes + providers
└── main.tsx                 ← entry
```

Strict layering: `data → state → hooks/utils → components → pages`. Lower layers never import from higher ones.

---

## Data Model

All types in `src/features/retention/data/types.ts`.

| Type | Purpose |
|---|---|
| `Account` | An at-risk customer. Owner, plan, MRR, `riskScore` (0-100), `trend`, `topReason`, list of `Signal`s, a representative `quote`, plus a `recommended` action and `alternates`. |
| `Signal` | One reason an account is at risk. `label`, `detail`, `weight: high \| med \| low`. |
| `Action` | A proposed intervention. `title`, `preview` (message body), `channel`, `expectedLift`. |
| `Channel` | `"in-app nudge" \| "email" \| "Slack message"`. |
| `LogEntry` | Audit record of a sent intervention. `accountId`, `actionId`, `channel`, `at`, `by`, `status`. |
| `SnoozeEntry` | `accountId`, `snoozedAt`, `durationMs`, `by`. Auto-expires via `useNow()` tick. |

**Derived state** (computed in `useAccountQueue`):
- **Queue** = accounts where `intervened` is false AND snooze is expired/absent AND `hideAll` is off, sorted by `riskScore` desc.
- **Snoozed** = entries in `snoozed` map whose `snoozedAt + durationMs > now`.
- **All Clear** = queue is empty.

---

## Components

### Pages (`features/retention/pages/`)
| File | Screen | Purpose |
|---|---|---|
| `AtRiskQueuePage.tsx` | At-Risk Queue | Main triage view. Left: ranked list. Right: detail panel for the selected account. |
| `AccountDetailPanel.tsx` *(component)* | — | Right pane showing signals, quote, recommended + alternate actions, snooze + intervene CTAs. |
| `InterventionConfirmationPage.tsx` | Intervention Confirmation | Post-send success state with logged entry summary; routes back to queue. |
| `SnoozedAccountsPage.tsx` | Snoozed Accounts | Lists snoozed accounts with countdown and unsnooze. |
| `AllClearPage.tsx` | All Clear | Empty-state celebration when queue is drained. |
| `InterventionHistoryPage.tsx` | Intervention History | Reverse-chronological log of every intervention sent. |

### Components (`features/retention/components/`)
| File | Purpose |
|---|---|
| `AccountRow.tsx` | One row in the queue list — owner avatar, team, risk score, trend, top reason. |
| `AccountDetailPanel.tsx` | Right-side detail view (composed inside `AtRiskQueuePage`). |
| `AccountDetailPanelSkeleton.tsx` | Loading shimmer shown via `useDetailLoading` while a row is selected. |
| `RiskBadge.tsx` | Color-coded score pill (high/med/low thresholds). |

### State / Hooks
| File | Purpose |
|---|---|
| `state/RetentionContext.tsx` | Single store. Exposes `accounts`, `intervened`, `snoozed`, `logs`, plus `intervene/snooze/unsnooze` mutators. Owns the simulated send latency + failure rate. |
| `hooks/useAccountQueue.ts` | Selects + sorts the visible queue and the snoozed list from context. |
| `hooks/useDetailLoading.ts` | Brief artificial delay when switching rows so the skeleton is visible. |
| `hooks/useNow.ts` | Ticks every second so snooze countdowns expire live. |

### Utils
| File | Purpose |
|---|---|
| `utils/channels.ts` | Icon + label metadata for each `Channel`. |
| `utils/time.ts` | `formatRelative`, `formatCountdown` helpers. |

### Layout
| File | Purpose |
|---|---|
| `layout/AppShell.tsx` | Sidebar nav + page outlet. |
| `layout/NavLink.tsx` | Active-state nav item. |

---

## Mocked vs. Real

| Concern | Status | Where |
|---|---|---|
| Account list, signals, quotes, actions | **Mocked** | `data/accounts.ts` (static seed array) |
| Risk score / trend | **Mocked** | Hand-tuned per account; no model |
| `intervene()` — send latency | **Mocked** | `SEND_LATENCY_MS = 700` in `RetentionContext` |
| `intervene()` — delivery failures | **Mocked** | `FAILURE_RATE = 0.12`; `forceFailNext` dev toggle |
| Logged-in user (`"Jordan Kim"`) | **Mocked** | Hard-coded in `RetentionContext` |
| Snooze persistence | **Mocked** | In-memory `Map`; lost on reload |
| Intervention history | **Mocked** | In-memory array; lost on reload |
| Channels (in-app / email / Slack) | **Mocked** | No real delivery; UI-only |
| Routing, layout, design tokens, skeletons, toasts | **Real** | Production-quality |
| Accessibility (focus states, semantic HTML) | **Real** | — |
| Build/test toolchain (Vite, Vitest, Tailwind, shadcn) | **Real** | — |

---

## What to Build First (Suggested Order)

1. **Replace `RetentionContext`** with real fetches (`accounts`) + mutations (`intervene`, `snooze`). Keep the same exported shape.
2. **Persist** `snoozed` and `logs` server-side; remove the in-memory maps.
3. **Auth** — replace the hard-coded `"Jordan Kim"` with the session user.
4. **Real delivery adapters** per channel (transactional email, Slack app, in-app pubsub).
5. **Risk model** — replace seed `riskScore` with a real signal pipeline; keep `Signal[]` as the explainability contract.
