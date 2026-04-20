# Prompts & Results

A log of the three prompt iterations used to take the **Plansmith Retention** prototype from a single screen to a full PM workflow with multiple states and a HubSpot-grade detail panel. Each entry contains the verbatim prompt and the documented result.

---

## 1. Expand — multi-screen flow & navigation

### Prompt

> Add a 2nd screen: Intervention confirmation view. Match the layout of the attached confirmation screen reference.
>
> Add a 3rd screen: Snoozed accounts view showing all snoozed accounts with remaining time and resume action. Match the layout of the attached task queue reference.
>
> Add a 4th screen: Empty state view when no at-risk accounts exist. Match the layout of the attached empty state dashboard reference.
>
> Add a 5th screen: Intervention history view showing past interventions with status and filters. Match the layout of the attached activity log reference.
>
> Build navigation between all 5 screens.

### Result

- **Shared state lifted into `RetentionContext`** — `intervened`, `snoozed` (with timestamps + duration), and `logs` (with `id`, `status`, account metadata) became a single store so all 5 screens stay in sync.
- **`AppShell` layout** — persistent left sidebar with live counts for At-risk queue, Snoozed, Intervention history, plus an "All-clear preview" toggle for demoing the empty state.
- **5 screens wired with `react-router-dom`**:
  1. **At-risk queue** (`/`) — unchanged UX; "Send intervention" now navigates to confirmation.
  2. **Confirmation** (`/confirmation/:entryId`) — hero check, receipt grid (channel/sender/time), 3-step "what happens next" with auto-follow-up, live Q2 progress bar, "Next at-risk: {team}" CTA pulling the highest-risk remaining account.
  3. **Snoozed** (`/snoozed`) — table with risk badge, snooze reason, owner chip, live countdown ("12h 34m left", urgent <6h), one-click **Resume** that pops accounts back into the queue.
  4. **All-clear** (`/all-clear`) — celebratory inbox-zero state with quarter stats, suggested next steps, latest 3 interventions, toggle to exit preview mode.
  5. **History** (`/history`) — segmented status filters (All / Awaiting / Responded / Re-engaged), channel dropdown, search, typed activity log.
- **End-to-end flow tested**: send intervention → confirmation → "Next at-risk" → snooze one → check Snoozed → check History → click "All-clear preview" to see empty state.

### Files created / changed

- `src/state/RetentionContext.tsx` — new
- `src/components/AppShell.tsx` — new
- `src/pages/Confirmation.tsx` — new
- `src/pages/Snoozed.tsx` — new
- `src/pages/AllClear.tsx` — new
- `src/pages/History.tsx` — new
- `src/App.tsx` — routing + provider
- `src/pages/Index.tsx` — refactored to use context

---

## 2. Behavior — loading, empty, and error states

### Prompt

> Add a loading state with skeleton screens for the account detail panel.
>
> Add an empty state for no at-risk accounts:
>
> "You're all caught up. No accounts require action right now."
>
> Add an error state for intervention failure:
>
> "Intervention failed to send. Please retry or choose another action."
>
> Maintain the same design language throughout and tether all behavior strictly to these rules.

### Result

**Loading state — `AccountDetailSkeleton.tsx`**

- Pixel-mirrors the real detail panel layout (avatar + ring, header chips, "why" warning block with bullet rows, quote card, 3 action cards, action bar) so there's zero layout shift on load.
- Triggered in `Index.tsx` for 500 ms after every `activeId` change via a cleanup-safe `useEffect` timer.

**Empty state — `AllClear.tsx`**

- Headline updated to the **exact required copy**: *"You're all caught up."* with subline *"No accounts require action right now."*
- Same hero treatment (success ring, inbox-zero label) as the rest of the design language.

**Error state — `AccountDetail.tsx` + `RetentionContext.tsx`**

- `intervene()` is now `Promise<LogEntry>` with a stubbed 700 ms latency and a 12% failure rate (channel-specific error messages: SMTP 550 / Slack token expired / offline session). A `forceFailNext` flag is exposed on context for deterministic demos.
- `AccountDetail` `await`s the call, catches the rejection, and renders an inline alert above the action bar with the **exact required copy**: *"Intervention failed to send. Please retry or choose another action."* plus the underlying delivery message.
- Two affordances:
  - **Retry** — re-sends same action, shows spinning `RotateCw` while pending.
  - **Choose another action** — auto-selects the next available action and clears the error.
- Picking a different action manually also clears the error. Snooze remains available as an escape hatch.
- Uses existing `destructive` / `danger-soft` tokens — no new colors introduced.

### Files created / changed

- `src/components/AccountDetailSkeleton.tsx` — new
- `src/state/RetentionContext.tsx` — `intervene` now async, failure simulation
- `src/components/AccountDetail.tsx` — error banner + async handler
- `src/pages/Index.tsx` — skeleton wired to `activeId` change
- `src/pages/AllClear.tsx` — exact copy

---

## 3. Refine — HubSpot-grade hierarchy on the detail panel

### Prompt

> Focus only on the account detail panel.
>
> Start by listing the 3 biggest gaps in layout, spacing, and hierarchy compared to the HubSpot UI standard.
>
> Once identified, adjust spacing, improve hierarchy of sections, and resize the suggested intervention section to make it visually dominant.
>
> Don't change anything else in the project.

### Result

#### Gaps identified

1. **Flat hierarchy** — every section ("Why they're at risk", "In their words", "Suggested intervention", "Activity & ownership") used identical chrome (uppercase label, same icon size, same vertical rhythm), giving the user's eye no anchor. HubSpot's CRM record pages use a clear primary-vs-supporting hierarchy: the *next action* is the loudest object on the page, supporting context recedes.
2. **Uniform spacing instead of a scale** — everything was `space-y-6` between sections and `p-5`/`p-4` inside cards. HubSpot stacks information into clearly grouped cards with generous padding around the *primary* action and tighter padding around secondary content.
3. **Suggested intervention had the same visual weight as the quote** — same card chrome, same icon treatment, same width, smaller-than-recommended action target. The "expected lift" stat was buried as muted micro-copy when it was the strongest reason to act.

#### Changes applied

- **Spacing scale** — switched from uniform `space-y-6 / p-5` to a tiered scale: `space-y-8` between major regions, `p-5` only on hero action cards, `p-4` on context cards, `py-3.5` rows in activity. Vertical padding bumped `py-6` → `py-7`.
- **Hierarchy reordered into 3 tiers**:
  - **Hero** — *Suggested intervention* now leads. Wrapped in a primary-tinted `bg-accent/30` surface with `border-primary/20` + shadow, larger 16px section title with subtitle, action cards padded to `p-5` with 40px channel icons (was 32px), 15px action titles (was 14px). **Expected lift** moved into a prominent green `success-soft` pill instead of muted micro-copy.
  - **Context** — *Why* + *Quote* paired side-by-side in a 5-col grid (3:2 split, stacks on smaller widths), with smaller 11px tracked labels and tighter padding so they read as supporting evidence to the action above.
  - **Supporting** — *Activity & ownership* visually demoted with a top divider, smaller muted icon, and the same 11px label as the context tier.
- **Net result** — the user's eye lands on "what to do" first, then "why" + "in their words" as compact justification, then activity as a quiet log — matching how HubSpot's record pages weight Next Step → Properties → Activity.

### Files changed

- `src/components/AccountDetail.tsx` — only file touched, per scope constraint

---

## How to run

```bash
bun install
bun run dev
```

Then open the preview and try the full flow: queue → send intervention (~1 in 8 will fail to demo the error state) → confirmation → snooze something → review history → click "All-clear preview" in the sidebar to see the empty state.
