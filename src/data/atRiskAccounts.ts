export type Signal = {
  label: string;
  detail: string;
  weight: "high" | "med" | "low";
};

export type Action = {
  id: string;
  title: string;
  preview: string;
  channel: "in-app nudge" | "email" | "Slack message";
  expectedLift: string;
};

export type Account = {
  id: string;
  team: string;
  plan: string;
  seats: number;
  owner: { name: string; role: string; avatar: string };
  daysSinceSignup: number;
  riskScore: number; // 0-100
  trend: "up" | "down" | "flat";
  topReason: string;
  signals: Signal[];
  quote: { text: string; source: string; channel: string };
  recommended: Action;
  alternates: Action[];
  mrr: number;
};

export const accounts: Account[] = [
  {
    id: "acme-robotics",
    team: "Acme Robotics",
    plan: "Business",
    seats: 14,
    owner: { name: "Priya Shah", role: "Eng Manager", avatar: "PS" },
    daysSinceSignup: 6,
    riskScore: 92,
    trend: "up",
    topReason: "Solo workspace — 0 of 14 seats invited",
    signals: [
      { label: "No teammates invited", detail: "0 of 14 paid seats activated after 6 days", weight: "high" },
      { label: "0 tasks created", detail: "Owner opened the app 4 times, never created a task", weight: "high" },
      { label: "Watched onboarding video, bounced", detail: "Dropped at step 2 of 4 (Invite team)", weight: "med" },
    ],
    quote: {
      text: "I spent twenty minutes trying to figure out how to add my team. I gave up and went back to Asana for the day.",
      source: "Priya S., Acme Robotics",
      channel: "Intercom reply, day 4",
    },
    recommended: {
      id: "invite-assist",
      title: "Send 1-click invite link Priya can forward",
      preview:
        "Hi Priya — noticed you're rolling out solo. I generated a pre-filled invite link for your 13 teammates so you can drop it in Slack. Want me to also pull names from your Google Workspace?",
      channel: "in-app nudge",
      expectedLift: "+41% 90-day retention for accounts that invite ≥1 teammate by day 7",
    },
    alternates: [
      {
        id: "csv-import",
        title: "Offer Google Workspace import",
        preview: "One-click sync to pull all 14 teammates from Acme's directory.",
        channel: "email",
        expectedLift: "+28%",
      },
      {
        id: "live-onboarding",
        title: "Book a 15-min team setup call",
        preview: "Calendly link with the onboarding specialist who closed Acme's deal.",
        channel: "email",
        expectedLift: "+33%",
      },
    ],
    mrr: 420,
  },
  {
    id: "northwind",
    team: "Northwind Studio",
    plan: "Business",
    seats: 8,
    owner: { name: "Marcus Lee", role: "Head of Ops", avatar: "ML" },
    daysSinceSignup: 11,
    riskScore: 78,
    trend: "up",
    topReason: "1 invite sent, never accepted — owner stalled",
    signals: [
      { label: "1 invite sent, 0 accepted", detail: "Sent to designer@northwind on day 2, expired", weight: "high" },
      { label: "3 tasks created, then silent for 6 days", detail: "Last activity Apr 14", weight: "high" },
      { label: "No project template chosen", detail: "Still on default 'My Tasks' view", weight: "low" },
    ],
    quote: {
      text: "My designer never got the invite — said it went to spam. I haven't had time to chase it.",
      source: "Marcus L., Northwind Studio",
      channel: "NPS survey, day 9",
    },
    recommended: {
      id: "resend-invite",
      title: "Resend invite + nudge designer directly",
      preview:
        "Resend the expired invite to designer@northwind from a no-reply@yourcompany address (better deliverability), and ping Marcus that it's been re-sent.",
      channel: "email",
      expectedLift: "+22% 90-day retention when stalled invite is recovered",
    },
    alternates: [
      {
        id: "template",
        title: "Suggest the Creative Agency template",
        preview: "Pre-built workflow matching Northwind's industry (set during signup).",
        channel: "in-app nudge",
        expectedLift: "+14%",
      },
    ],
    mrr: 240,
  },
  {
    id: "globex",
    team: "Globex Logistics",
    plan: "Business",
    seats: 22,
    owner: { name: "Hana Okafor", role: "PMO Lead", avatar: "HO" },
    daysSinceSignup: 19,
    riskScore: 71,
    trend: "flat",
    topReason: "High activity, but only 2 of 22 seats invited",
    signals: [
      { label: "Only 2 of 22 seats used", detail: "$1,760/mo paid for unused seats", weight: "high" },
      { label: "Owner created 47 tasks solo", detail: "No assignees — collaboration risk", weight: "med" },
      { label: "Hit Slack integration paywall, didn't upgrade", detail: "Day 12", weight: "low" },
    ],
    quote: {
      text: "I'm using it as a personal to-do list. Rolling it out to the whole PMO scares me — I don't want to be the support desk.",
      source: "Hana O., Globex Logistics",
      channel: "Customer interview, day 17",
    },
    recommended: {
      id: "rollout-kit",
      title: "Send Hana the team rollout kit",
      preview:
        "Pre-written Slack announcement, a 5-min Loom for her teammates, and an offer to white-glove the first project import. Removes the 'I'll be the support desk' fear directly.",
      channel: "email",
      expectedLift: "+36% retention on accounts with <20% seat activation",
    },
    alternates: [
      {
        id: "csm-intro",
        title: "Assign a CSM (account is >$1.5K MRR)",
        preview: "Trigger the white-glove path normally reserved for Enterprise.",
        channel: "email",
        expectedLift: "+45%",
      },
    ],
    mrr: 1760,
  },
  {
    id: "fern-co",
    team: "Fern & Co.",
    plan: "Starter",
    seats: 4,
    owner: { name: "Sam Rivera", role: "Founder", avatar: "SR" },
    daysSinceSignup: 3,
    riskScore: 64,
    trend: "up",
    topReason: "Bounced after seeing the empty dashboard",
    signals: [
      { label: "0 tasks created", detail: "2 sessions, both <90 seconds", weight: "high" },
      { label: "Hovered on 'Invite' but didn't click", detail: "Session replay, day 1", weight: "med" },
    ],
    quote: {
      text: "Honestly I logged in, saw a blank screen, and had no idea where to start. Felt like homework.",
      source: "Sam R., Fern & Co.",
      channel: "Cancellation flow draft, day 3",
    },
    recommended: {
      id: "starter-template",
      title: "Auto-load the 'Solo Founder' starter board",
      preview:
        "Pre-populate 6 sample tasks Sam can edit instead of facing a blank canvas. Triggered on next login with a one-line explainer.",
      channel: "in-app nudge",
      expectedLift: "+29% activation when first-task friction is removed",
    },
    alternates: [
      {
        id: "founder-email",
        title: "Personal email from the founder",
        preview: "Short, plain-text 'how can I help you get started?' from the CEO.",
        channel: "email",
        expectedLift: "+18%",
      },
    ],
    mrr: 49,
  },
  {
    id: "vertex",
    team: "Vertex Capital",
    plan: "Business",
    seats: 12,
    owner: { name: "Daniel Cho", role: "COO", avatar: "DC" },
    daysSinceSignup: 24,
    riskScore: 58,
    trend: "down",
    topReason: "Recovering — 3 invites sent yesterday",
    signals: [
      { label: "3 new invites sent in last 24h", detail: "Trend reversing", weight: "low" },
      { label: "Still no recurring projects", detail: "Industry benchmark: 2 by day 21", weight: "med" },
    ],
    quote: {
      text: "Took us a while but we're getting there. The Gantt view finally clicked for our IC meetings.",
      source: "Daniel C., Vertex Capital",
      channel: "Support ticket, day 22",
    },
    recommended: {
      id: "monitor",
      title: "No action — monitor for 7 days",
      preview: "Risk is trending down on its own. Re-evaluate Apr 27.",
      channel: "in-app nudge",
      expectedLift: "Avoid intervention fatigue",
    },
    alternates: [
      {
        id: "tip",
        title: "Send the 'Recurring Projects' tip",
        preview: "Lightweight in-app tip, no human touch needed.",
        channel: "in-app nudge",
        expectedLift: "+8%",
      },
    ],
    mrr: 360,
  },
];
