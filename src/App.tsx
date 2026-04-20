import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Confirmation from "./pages/Confirmation.tsx";
import Snoozed from "./pages/Snoozed.tsx";
import AllClear from "./pages/AllClear.tsx";
import History from "./pages/History.tsx";
import { RetentionProvider } from "./state/RetentionContext.tsx";
import { AppShell } from "./components/AppShell.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RetentionProvider>
          <Routes>
            <Route
              path="/"
              element={
                <AppShell>
                  <Index />
                </AppShell>
              }
            />
            <Route
              path="/confirmation/:entryId"
              element={
                <AppShell>
                  <Confirmation />
                </AppShell>
              }
            />
            <Route
              path="/snoozed"
              element={
                <AppShell>
                  <Snoozed />
                </AppShell>
              }
            />
            <Route
              path="/history"
              element={
                <AppShell>
                  <History />
                </AppShell>
              }
            />
            <Route
              path="/all-clear"
              element={
                <AppShell>
                  <AllClear />
                </AppShell>
              }
            />
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
