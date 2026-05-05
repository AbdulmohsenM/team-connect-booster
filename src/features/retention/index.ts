// Public surface for the retention feature.
export { RetentionProvider, useRetention } from "./state/RetentionContext";

export { default as AtRiskQueuePage } from "./pages/AtRiskQueuePage";
export { default as InterventionConfirmationPage } from "./pages/InterventionConfirmationPage";
export { default as SnoozedAccountsPage } from "./pages/SnoozedAccountsPage";
export { default as AllClearPage } from "./pages/AllClearPage";
export { default as InterventionHistoryPage } from "./pages/InterventionHistoryPage";

export type { Account, Action, Channel, LogEntry, SnoozeEntry, Signal } from "./data/types";
