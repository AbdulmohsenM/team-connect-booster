# Product Requirements Document — Plansmith Retention

> A clickable prototype for a churn-intervention workflow inside a B2B project management SaaS.

---

## 1. What It Does

Plansmith Retention is a **workflow tool** (not a dashboard) that surfaces at-risk customer accounts to a Product Manager, explains *why* each account is at risk, and recommends a specific, one-click intervention with an expected lift estimate.

The PM works through a prioritized queue — review signals → review the customer's own words → send the recommended intervention (in-app nudge, email, or Slack) → auto-advance to the next account. Snoozing, alternate actions, and an intervention history are first-class affordances.

---

## 2. Who It's For

**Primary user:** Product Manager at a Series A / Series B B2B SaaS company who owns activation and 90-day retention.

- Owns a retention KPI but does not own a CRM seat
- Operates in a queue/inbox mental model (Linear, Front, Intercom)
- Needs to act on individual accounts, not just read aggregate charts
- Has limited time per account (target: <60 seconds per intervention)

**Secondary users (out of scope for prototype):** CSMs, growth engineers, founders watching the same KPI.

---

## 3. The Problem

A B2B project management SaaS at Series A is losing **30% of new customers within 90 days**. The board has tied Series B funding to fixing this within a quarter.

Existing tooling fails because:
- **Dashboards are passive** — they describe the problem but don't drive action
- **CRMs are heavyweight** — built for sales motion, not for PM-led activation interventions
- **Signals live in silos** — product analytics, support tickets, and survey responses don't converge on a single "what should I do about this account today?" view
- **No memory** — when a PM does intervene, there's no shared log of who did what, when, on which channel

The result: PMs know retention is bad, but the path from "I see the number" to "I sent an intervention to a specific account" is too long, so it doesn't happen consistently.

---

## 4. Hypothesis

> **If** we surface churn risk score, the *why* behind it, and a one-click recommended action in a queue-style PM workspace,
> **then** PMs will intervene on at-risk accounts within 48 hours,
> **and** inactive-at-risk users will drop ~30% within 7 days of intervention.

**Supporting insight:** Users who invite a teammate in their first 3 days retain at 3× the rate (68% vs 22%). Only 12% do. **Solo workspace = highest-leverage churn signal.**

---

## 5. Screens

| # | Screen | Route | Purpose |
|---|--------|-------|---------|
| 1 | **At-Risk Queue + Account Detail** | `/` | Triage view. Left: filterable queue (Needs action / Snoozed / Intervened) sorted by risk score. Right: detail panel showing risk breakdown, customer quote, recommended intervention with expected lift, and 1–2 alternates. The PM's primary workspace. |
| 2 | **Intervention Confirmation** | `/confirmation/:entryId` | Post-send acknowledgement. Confirms what was sent, to whom, on what channel, and what to expect next. Provides a clear "next account" CTA to maintain momentum. |
| 3 | **Snoozed Accounts** | `/snoozed` | Lists accounts temporarily removed from the queue (default 48h) with remaining time and a Resume action. Prevents snoozes from being forgotten. |
| 4 | **All Clear (Empty State)** | `/all-clear` | Shown when no accounts require action. Reinforces the zero-inbox model and surfaces upcoming wake-ups from the snooze list. |
| 5 | **Intervention History** | `/history` | Audit log of every intervention sent: account, action, channel, sender, timestamp, current status. Filterable by status and channel. Provides accountability and a base for measuring lift. |

---

## 6. User Flow

```
┌─ Open Retention workspace (/)
│   ↓
│   See N accounts ranked by risk score, highest first
│   ↓
│   Click highest-risk account → detail panel loads (skeleton → content)
│   ↓
│   Review: risk signals (weighted) + customer quote + recommended action
│   ↓
│   ┌── Send intervention ──────────────┐
│   │   ↓                               │
│   │   Async send (success path)       │ (failure path)
│   │   ↓                               │   ↓
│   │   /confirmation/:id               │   Inline error banner with
│   │   ↓                               │   Retry / Choose another action
│   │   "Next account" CTA              │
│   │   ↓                               │
│   └── Auto-advance to next at-risk ───┘
│   ↓
│   OR Snooze 48h → next account auto-selects
│   ↓
│   Later: /history to track responses
│           /snoozed to resume earlier deferrals
│           /all-clear when queue is empty
```

**Anchor interaction patterns:**
- **One-click intervention** — no multi-step modal between intent and send
- **Auto-advance** — momentum is a design goal, not an afterthought
- **Snooze with countdown** — defer without losing the thread
- **Inline error recovery** — failures stay in context, not in a toast

---

## 7. Key Metrics

**North Star**
- 90-day retention rate of new customers (board-level KPI)

**Primary product metrics**
- % of at-risk accounts with an intervention sent within 48h of appearing in queue (target: >70%)
- Median time from account-open to intervention-sent (target: <60s)
- 7-day re-engagement rate of intervened accounts vs. control (target: +30%)

**Secondary / health metrics**
- Intervention delivery success rate (channel reliability)
- Snooze-to-intervene conversion (are snoozes a healthy defer or a black hole?)
- Recommended-action acceptance rate vs. alternate-action rate (signal quality)
- PM weekly active usage of the queue

**Counter-metrics (guardrails)**
- Customer-reported intervention fatigue / unsubscribe rate
- False-positive rate on risk score (interventions sent to accounts that were never going to churn)

---

## 8. Mocked vs. Real

| Layer | Status | Notes |
|-------|--------|-------|
| **UI / interaction model** | Real | Production-grade React + TypeScript + Tailwind + shadcn/ui. The interaction patterns are the artifact under test. |
| **Routing & navigation** | Real | `react-router-dom`, 5 routes wired through a shared `AppShell`. |
| **State management** | Real (in-memory) | `RetentionContext` holds intervened set, snooze map, and log entries. Resets on reload — no persistence. |
| **Account data** | Mocked | 5 hand-authored accounts in `src/data/atRiskAccounts.ts` representing distinct churn archetypes (solo workspace, stalled invite, overspend, blank-slate bounce, recovering). |
| **Risk scores & weights** | Mocked | Hardcoded per account; not computed from any model. |
| **Customer quotes** | Mocked | Plausible quotes attributed to fake support/survey sources. |
| **Expected-lift %** | Mocked | Static per recommended action; not derived from historical data. |
| **Intervention send** | Stubbed | Async `Promise` with 700ms simulated latency and a 12% random failure rate (or `forceFailNext` for demos). No real email/Slack/in-app delivery. |
| **Loading state** | Real | 500ms skeleton on detail-panel selection mimics a fetch boundary. |
| **Error state** | Real | Inline banner with Retry + Choose-another-action handlers. |
| **Empty state** | Real | `/all-clear` route with the exact required copy. |
| **Auth, accounts, permissions** | Not built | Single hardcoded operator: "Jordan Kim". |
| **Backend / database** | Not built | No Lovable Cloud, no Supabase, no API. Pure client. |
| **Analytics / metrics tracking** | Not built | KPIs above are aspirational targets, not instrumented. |

---

## 9. Out of Scope (for this prototype)

- Real channel integrations (email/Slack/in-app SDK)
- Risk-scoring model and feature pipeline
- Multi-user collaboration, assignment, comments
- Customer-side view of the intervention
- A/B test infrastructure to actually measure the +30% lift claim
- Mobile layout (desktop-first; viewport assumed ≥1280px)

---

*Prototype built with Lovable. Source: see `README.md` for architecture and `PROMPTS.md` for build iterations.*
