# Product Requirements Document — Plansmith Retention

> A clickable, PM-facing churn-intervention console for a B2B project management SaaS.
> Audited against the original brief, the codebase (`src/data/atRiskAccounts.ts`, `RetentionContext`, `AppShell`, all 5 pages), and the build log in `PROMPTS.md`.

---

## 1. What It Does

Plansmith Retention turns churn risk from a chart into a **queue of decisions**. For each at-risk paying team it shows the PM (Jordan Kim, "PM · Growth") three things in one view:

1. **Risk score (0–100)** with weighted behavioral signals that explain the number
2. **A real customer quote** with source + channel attribution (Intercom reply, NPS survey, customer interview, support ticket, cancellation flow draft)
3. **A recommended one-click intervention** with channel (in-app nudge / email / Slack message), preview copy, and an expected-lift estimate — plus 1–2 alternates

The PM sends, snoozes (48h default), or moves on. Every action is logged with who/when/channel/status. The product is deliberately a **workflow tool, not a dashboard** — the brief explicitly required "a product a user interacts with, NOT a dashboard or analysis."

---

## 2. Who It's For

**Primary user:** Product Manager owning activation / 90-day retention at a Series A B2B SaaS.

- Represented in-product as **Jordan Kim, PM · Growth** (single hardcoded operator).
- Works in a queue/inbox mental model (Linear, Front, Intercom).
- Has no CRM seat and no engineering bandwidth (the brief stipulates "no engineering resources for 6 weeks").
- Needs to act on a specific account in under a minute.

**Out of scope users:** CSMs, founders, the at-risk customer themselves.

---

## 3. The Problem

Verbatim from the brief:

> **Company:** B2B project management SaaS. 5,000 paying teams. $4.2M ARR. Series A. 18 months old.
> **Problem:** 30% of new customers churn within 90 days. The company cannot raise Series B with this churn rate. The board has given the team one quarter to show measurable improvement.
> **Key data:** Users who invite a teammate in the first 3 days retain at 3× the rate (68% vs 22%). Only 12% of new users send an invite in the first 3 days. The invite button is buried in `Settings > Team > Members`. 60% of new users never create their first task.
> **Constraints:** No engineering resources for 6 weeks. Must work within the existing product. Prototype only.

Existing tooling fails because dashboards are passive, CRMs are sales-shaped, and risk signals live in silos. There is no single "what should I do about *this* account today?" surface for a PM.

---

## 4. Hypothesis

> **If** we surface churn risk score, *why*, and a suggested action in the PM dashboard,
> **then** PMs intervene within 48 hours and reduce inactive-at-risk users by ~30% within 7 days,
> **because** PMs lack actionable visibility into who is at risk and why, so interventions are delayed or skipped.

**Riskiest assumption (what the prototype actually tests):** *Will a PM click "Send intervention" when given a clear risk + clear reason + clear next step?*
**Risk type:** Usability.
**Fidelity:** Clickable flow.

**Kill switch:** If PMs still don't act even with clear risk and a clear next step, the solution fails — the bottleneck is motivation/trust, not visibility, and a different intervention is needed.

---

## 5. Validation Criteria

The prototype is **validated if all three hold** in user testing:

| # | Metric | Threshold | Where it shows up in the UI |
|---|--------|-----------|------------------------------|
| 1 | Intervention rate | **≥50%** of at-risk accounts receive an intervention | Q2 progress bar on the queue + Confirmation screen |
| 2 | Engagement recovery | **≥30%** of intervened accounts re-engage within 7 days | History screen (status: *Re-engaged*) |
| 3 | Time-to-intervention | **Decreases** vs. baseline | Implicit — measured by session, not surfaced in UI |

---

## 6. Screens

| # | Screen | Route | Purpose |
|---|--------|-------|---------|
| 1 | **At-Risk Queue + Account Detail** | `/` | The PM's primary workspace. Left: queue sorted by risk score, with workflow filters (Needs action / Snoozed / Intervened) and a Q2 goal progress bar. Right: detail panel — risk-score ring, weighted *why* signals, customer quote with source, recommended action with expected lift, alternates, and an Activity & ownership timeline. Loading state uses a layout-mirroring skeleton; error state shows an inline banner with Retry / Choose another action. |
| 2 | **Intervention Confirmation** | `/confirmation/:entryId` | Receipt for what was just sent (action, channel, sender, timestamp), a 3-step "what happens next" with auto-follow-up timing, the live Q2 progress bar, and a **Next at-risk: {team}** CTA that pulls the highest-risk remaining account so the PM keeps moving. |
| 3 | **Snoozed Accounts** | `/snoozed` | Table of deferred accounts with risk badge, owner, snooze reason, and a live countdown ("12h 34m left", urgent <6h). One-click **Resume** returns the account to the queue. Prevents snoozes from being forgotten. |
| 4 | **All Clear (empty state)** | `/all-clear` | Inbox-zero state. Headline: *"You're all caught up."* Subline: *"No accounts require action right now."* Surfaces upcoming snooze wake-ups, latest 3 interventions, and a toggle to exit preview mode. |
| 5 | **Intervention History** | `/history` | Full audit log of every intervention — account, action, channel, sender, timestamp, status. Segmented filters (All / Awaiting response / Responded / Re-engaged), channel dropdown, search. Provides accountability and is the surface where validation metric #2 lives. |

A persistent left **AppShell** (Plansmith logo, Projects/Inbox/Customers stub items, Retention section with live counts, Jordan Kim user chip) ties the 5 screens together.

---

## 7. User Flow

```
┌─ Open Retention workspace (/)
│   ↓
│   See N accounts ranked by risk, highest first (Acme 92 → Vertex 58)
│   ↓
│   Click highest-risk → detail panel loads (500ms skeleton → content)
│   ↓
│   Review weighted signals + customer quote + recommended action
│   ↓
│   ┌── Send intervention ──────────────────────┐
│   │   ↓                                       │
│   │   Async send (700ms latency, 12% fail)    │
│   │   ↓                              ↓        │
│   │   SUCCESS                        FAILURE  │
│   │   ↓                              ↓        │
│   │   /confirmation/:entryId         Inline error banner:
│   │   ↓                              "Intervention failed to send.
│   │   "Next at-risk: {team}" CTA      Please retry or choose
│   │   ↓                               another action."
│   └── Auto-advance ──────────────────  + Retry / Choose another
│   ↓
│   OR Snooze 48h → next account auto-selects
│   ↓
│   Later: /history (track responses)
│           /snoozed (resume deferrals)
│           /all-clear (when queue empty)
```

**Anchor patterns:**
- **One-click intervention** — no modal between intent and send.
- **Auto-advance** — momentum is a design goal.
- **Snooze with live countdown** — defer without losing the thread.
- **Inline error recovery** — failures stay in the panel, not in a toast.

---

## 8. Key Metrics

**North Star** — 90-day retention rate of new customers (board KPI).

**Primary product metrics (mirror the validation criteria):**
- Intervention rate per at-risk account ≥50% (surfaced as Q2 progress bar)
- Engagement recovery rate within 7 days ≥30% (History screen)
- Median time from account-open → intervention-sent — target <60s

**Secondary / health metrics:**
- Recommended-action acceptance rate vs. alternate-action rate (signal-quality proxy)
- Snooze-to-intervene conversion (are snoozes a healthy defer or a black hole?)
- Channel delivery success rate (in-app / email / Slack)
- PM weekly active usage of the queue

**Counter-metrics (guardrails):**
- Customer-side intervention fatigue / unsubscribe rate
- False-positive rate on the risk score (interventions sent to accounts that were never going to churn — Vertex Capital's "monitor only" recommendation is the in-product nod to this)

---

## 9. Mocked vs. Real

| Layer | Status | Notes |
|-------|--------|-------|
| **UI / interaction model** | Real | React 18 + TypeScript + Vite + Tailwind v3 + shadcn/ui. The interaction patterns are the artifact under test. |
| **Routing & navigation** | Real | `react-router-dom`, 5 routes wired through `AppShell`. |
| **State management** | Real (in-memory) | `RetentionContext` holds `intervened: Set`, `snoozed: Map<id, SnoozeEntry>`, `logs: LogEntry[]`. Resets on reload. |
| **Account data** | Mocked | 5 hand-authored accounts in `src/data/atRiskAccounts.ts` covering distinct churn archetypes — Acme Robotics (solo workspace, 92), Northwind Studio (stalled invite, 78), Globex Logistics (unused seats, 71), Fern & Co. (blank-canvas bounce, 64), Vertex Capital (recovering, 58). |
| **Risk scores & signal weights** | Mocked | Hardcoded per account. No model. |
| **Customer quotes** | Mocked but *specific* | Brief required real-feeling user voice with source + channel (Intercom day 4, NPS day 9, customer interview day 17, support ticket day 22, cancellation flow draft day 3). |
| **Expected-lift %** | Mocked | Static per action; not derived from historical data. |
| **Intervention send** | Stubbed | Async `Promise<LogEntry>` with 700ms latency and 12% random failure. `forceFailNext` flag exposed for deterministic demos. Channel-specific error copy (SMTP 550 / Slack token expired / offline session). No real delivery. |
| **Loading state** | Real | 500ms skeleton on every `activeId` change, layout-mirrored to prevent shift. |
| **Error state** | Real | Inline banner with the exact required copy + Retry / Choose another action. |
| **Empty state** | Real | `/all-clear` with the exact required copy + dev toggle in sidebar to preview. |
| **Snooze countdown** | Real | Live timer derived from `snoozedAt + durationMs`. |
| **Auth, accounts, permissions** | Not built | Single hardcoded operator: Jordan Kim. |
| **Backend / database** | Not built | No Lovable Cloud, no API. Pure client. |
| **Analytics / metrics tracking** | Not built | Validation metrics above are aspirational targets, not instrumented. |
| **Real channel integrations** | Not built | In-app / email / Slack are labels only. |

---

## 10. Constraints Honored from the Brief

- **No backend** — fits "no engineering resources for 6 weeks."
- **Prototype-only fidelity** — clickable flow, not a production system.
- **Specific over generic** — every account has its own failure mode tied directly to brief data ("60% never create a task", "12% invite in 3 days", "invite button buried in Settings").
- **Real user voice, not lorem ipsum** — every account has an attributed quote with channel + day.
- **Workflow, not dashboard** — queue + detail + auto-advance, no charts as the primary surface.

---

## 11. Out of Scope

- Real channel integrations (email/Slack/in-app SDK)
- Risk-scoring model and feature pipeline
- Multi-PM collaboration, assignment, comments
- Customer-side view of the intervention
- A/B test infrastructure to actually measure the +30% lift claim
- Editable intervention copy before send
- Mobile layout (desktop-first; viewport assumed ≥1280px)

---

*Source artifacts: `README.md` (architecture), `PROMPTS.md` (build iterations), `src/data/atRiskAccounts.ts` (account fixtures), `src/state/RetentionContext.tsx` (state + send stub).*
