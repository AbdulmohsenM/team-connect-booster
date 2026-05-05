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
import { SessionProvider, RequireAuth } from "@/features/auth/SessionProvider";
import AuthPage from "@/features/auth/AuthPage";
import ResetPasswordPage from "@/features/auth/ResetPasswordPage";
import { OfflineBanner } from "@/components/OfflineBanner";

const queryClient = new QueryClient();

const Protected = ({ children }: { children: React.ReactNode }) => (
  <RequireAuth>
    <RetentionProvider>
      <AppShell>{children}</AppShell>
    </RetentionProvider>
  </RequireAuth>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionProvider>
          <OfflineBanner />
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/" element={<Protected><AtRiskQueuePage /></Protected>} />
            <Route path="/confirmation/:entryId" element={<Protected><InterventionConfirmationPage /></Protected>} />
            <Route path="/snoozed" element={<Protected><SnoozedAccountsPage /></Protected>} />
            <Route path="/history" element={<Protected><InterventionHistoryPage /></Protected>} />
            <Route path="/all-clear" element={<Protected><AllClearPage /></Protected>} />
            <Route path="/empty-preview" element={<Navigate to="/all-clear" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
