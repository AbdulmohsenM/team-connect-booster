import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/layout/AppShell";
import NotFound from "./pages/NotFound.tsx";
import {
  RetentionProvider,
  AtRiskQueuePage,
  InterventionConfirmationPage,
  SnoozedAccountsPage,
  AllClearPage,
  InterventionHistoryPage,
} from "@/features/retention";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RetentionProvider>
          <Routes>
            <Route path="/" element={<AppShell><AtRiskQueuePage /></AppShell>} />
            <Route path="/confirmation/:entryId" element={<AppShell><InterventionConfirmationPage /></AppShell>} />
            <Route path="/snoozed" element={<AppShell><SnoozedAccountsPage /></AppShell>} />
            <Route path="/history" element={<AppShell><InterventionHistoryPage /></AppShell>} />
            <Route path="/all-clear" element={<AppShell><AllClearPage /></AppShell>} />
            {/* Sidebar preview shortcut to demo the empty state */}
            <Route path="/empty-preview" element={<Navigate to="/all-clear" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RetentionProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
