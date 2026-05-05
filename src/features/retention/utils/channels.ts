import { Mail, MessageSquare, Sparkles } from "lucide-react";
import type { Channel } from "../data/types";

/** Channel → icon lookup, shared across detail, confirmation, and history. */
export const channelIcon: Record<Channel, typeof Mail> = {
  "in-app nudge": Sparkles,
  email: Mail,
  "Slack message": MessageSquare,
};
