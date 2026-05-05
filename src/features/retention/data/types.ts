export type Signal = {
  label: string;
  detail: string;
  weight: "high" | "med" | "low";
};

export type Channel = "in-app nudge" | "email" | "Slack message";

export type Action = {
  id: string;
  title: string;
  preview: string;
  channel: Channel;
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

export type LogEntry = {
  id: string;
  accountId: string;
  accountTeam: string;
  ownerName: string;
  actionId: string;
  actionTitle: string;
  channel: Channel;
  at: number;
  by: string;
  status: "Awaiting response" | "Responded" | "Re-engaged";
};

export type SnoozeEntry = {
  accountId: string;
  snoozedAt: number;
  durationMs: number;
  by: string;
};

export type AccountNote = {
  id: string;
  accountId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: number;
};

export type RiskEvent = {
  id: string;
  accountId: string;
  eventType: "flagged" | "score_change" | "cleared";
  previousScore: number | null;
  newScore: number;
  occurredAt: number;
};

export type FollowUp = {
  id: string;
  logId: string;
  accountId: string;
  scheduledAt: number;
  completedAt: number | null;
};

export type OrgGoal = {
  id: string;
  metric: string;
  targetPct: number;
  periodStart: number;
  periodEnd: number;
};

export type UserPreferences = {
  defaultSnoozeHours: number;
};
