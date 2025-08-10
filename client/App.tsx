import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "@/components/Toast";

// Import pages
import Login from "./pages/Login";
import StaffDashboard from "./pages/StaffDashboard";
import StaffAttendance from "./pages/StaffAttendance";
import AdminDashboard from "./pages/AdminDashboard";
import AdminViewAttendance from "./pages/AdminViewAttendance";
import AdminReports from "./pages/AdminReports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/staff" element={<StaffDashboard />} />
          <Route
            path="/staff/attendance/:courseId"
            element={<StaffAttendance />}
          />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route
            path="/admin/view-attendance"
            element={<AdminViewAttendance />}
          />
          <Route path="/admin/reports" element={<AdminReports />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const container = document.getElementById("root")!;

// Check if root already exists to prevent multiple createRoot calls
if (!container._reactRootContainer) {
  const root = createRoot(container);
  container._reactRootContainer = root;
  root.render(<App />);
} else {
  // Re-render on existing root
  container._reactRootContainer.render(<App />);
}
