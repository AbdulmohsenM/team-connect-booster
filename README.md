# Plansmith Retention Prototype

A clickable prototype for a B2B project management SaaS retention intervention workflow.

---

## Hypothesis

Surfacing **churn risk score**, **why**, and **suggested action** in the PM dashboard leads to PMs intervening within 48 hours and reducing inactive-at-risk users by ~30% within 7 days.

### Supporting Insight
Users who invite a teammate in the first 3 days retain at **3x the rate** (68% vs 22%). Only **12%** of new users send an invite in that window. The core signal: **solo workspaces = high churn risk**.

---

## Scenario

**Company:** B2B project management SaaS  
**Stage:** Series A, 18 months old  
**Scale:** 5,000 paying teams, $4.2M ARR  
**Problem:** 30% of new customers churn within 90 days — a rate that threatens Series B fundraising  
**Goal:** One quarter to show measurable churn reduction

**The Board's ultimatum:** Improve the 90-day retention rate or the Series B is off the table.

---

## Key Screens

### 1. At-Risk Accounts Queue
- Filterable workflow queue: **Needs action** | **Snoozed** | **Intervened**
- Accounts sorted by risk score (0-100), highest first
- Real-time progress counter toward Q2 intervention goal
- Account cards show: team name, risk score, top churn reason, days since signup

### 2. Account Detail Panel
- **Risk breakdown:** Weighted behavioral signals explaining the score
- **Voice of customer:** Real user quote from support/survey data
- **Recommended action:** Context-aware intervention with expected lift (%)
- **Alternatives:** 1-2 fallback actions with different trade-offs
- **Activity & ownership timeline:** Historical context + live intervention log

### 3. Intervention Flow
- PM selects action → confirmation toast
- Account moves to "Intervened" bucket
- Timeline logs: who acted, when, via what channel, and current status
- Progress counter updates live

---

## User Flow

```
1. PM opens Retention workspace ← Sees 5 accounts needing action
   ↓
2. Clicks highest-risk account ← Sees why + what to do
   ↓
3. Reviews signals + customer quote ← Validates context
   ↓
4. Sends recommended intervention ← 1-click action
   ↓
5. Next highest-risk auto-selects ← Maintains momentum
   ↓
6. Returns later to check "Intervened" ← Tracks responses/follow-ups
```

**Key interaction patterns:**
- **Snooze:** Temporarily remove from queue (48h), auto-select next account
- **Filter switching:** Track progress across workflow stages
- **Activity timeline:** Understand what teammates already did

---

## Main Build Decisions

### 1. Queue-over-Dashboard Design
- Traditional dashboards are passive; this uses a **zero-inbox mental model**
- PMs work through a prioritized queue rather than scanning charts
- Maintains momentum with auto-advance after each action

### 2. Real Customer Voices
- Every account includes an actual user quote (support, survey, interview)
- Reduces abstraction — PMs intervene on people, not metrics
- Source attribution adds credibility and context

### 3. Domain-Specific Risk Signals
- Not generic "churn risk" — shows **why** (solo workspace, stalled invites, zero tasks)
- Weights on each signal explain score calculation
- Industry benchmarks referenced where relevant

### 4. Actionable Recommendations
- Each intervention includes:
  - **What:** Specific action title
  - **How:** Channel (in-app nudge, email, Slack)
  - **Preview:** Exact copy/content preview
  - **Expected lift:** Data-backed outcome prediction
- Alternatives provided for nuanced situations

### 5. Lightweight State Management
- No backend required for prototype testing
- `useState` for intervention/snooze tracking
- `useMemo` for reactive count updates
- Data persisted in session; resets on reload

### 6. Design System
- Tailwind CSS + shadcn/ui components
- Semantic color tokens (HSL) for theming
- `primary-gradient` accent for brand consistency
- Card-based layout for scannable information

---

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build:** Vite 5
- **Styling:** Tailwind CSS v3
- **Components:** shadcn/ui
- **Icons:** Lucide React
- **Toast notifications:** Sonner

---

## Test the Hypothesis

1. **Simulate PM workflow:** Send interventions on 2-3 accounts
2. **Observe queue behavior:** Confirm filters update live
3. **Review activity timeline:** Check intervention logging
4. **Validate UX:** Does this feel like a workflow tool, not a dashboard?

---

## Sample Accounts

| Account | Risk | Core Issue | Recommended Action |
|---------|------|------------|-------------------|
| **Acme Robotics** | 92 | 0 of 14 seats invited after 6 days | 1-click invite link for Priya |
| **Northwind Studio** | 78 | Invite sent, never accepted, owner stalled | Resend + ping designer directly |
| **Globex Logistics** | 71 | $1,760/mo for unused seats, owner overwhelmed | Team rollout kit + white-glove offer |
| **Fern & Co.** | 64 | Blank dashboard bounce | Auto-load starter template |
| **Vertex Capital** | 58 | Recovering — 3 invites sent | Monitor, avoid intervention fatigue |

---

## Running Locally

```bash
# Install dependencies
bun install

# Start dev server
bun dev

# Build for production
bun run build
```

---

*Built with Lovable — a product prototype for churn intervention workflows.*
