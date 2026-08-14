import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/auth-context";
import { ToastProvider } from "./components/ui/toast";
import AppShell from "./components/AppShell";
import { ShieldCheck, Loader2 } from "lucide-react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Privacy from "./pages/legal/Privacy";
import Terms from "./pages/legal/Terms";
import FAQ from "./pages/legal/FAQ";

import StudentDashboard from "./pages/dashboard/student/Dashboard";
import StudentSOS from "./pages/dashboard/student/SOS";
import StudentSafeWalk from "./pages/dashboard/student/SafeWalk";
import StudentIncidents from "./pages/dashboard/student/Incidents";
import StudentAlerts from "./pages/dashboard/student/Alerts";
import StudentGuardians from "./pages/dashboard/student/Guardians";
import StudentNotifications from "./pages/dashboard/student/Notifications";
import StudentSettings from "./pages/dashboard/student/Settings";
import StudentProfile from "./pages/dashboard/student/Profile";

import SecurityDashboard from "./pages/dashboard/security/Dashboard";
import SecurityAlerts from "./pages/dashboard/security/Alerts";
import SecuritySafeWalks from "./pages/dashboard/security/SafeWalks";
import SecurityIncidents from "./pages/dashboard/security/Incidents";
import SecurityBroadcast from "./pages/dashboard/security/Broadcast";
import SecurityUsers from "./pages/dashboard/security/Users";
import SecuritySettings from "./pages/dashboard/security/Settings";

import GuardianDashboard from "./pages/dashboard/guardian/Dashboard";
import GuardianTracking from "./pages/dashboard/guardian/Tracking";
import GuardianSettings from "./pages/dashboard/guardian/Settings";
import GuardianProfile from "./pages/dashboard/guardian/Profile";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <ShieldCheck className="h-10 w-10 text-red-600 animate-pulse" />
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm font-medium">Loading CampusGuard...</span>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to={`/dashboard/${user.role}`} replace />;
  return <AppShell>{children}</AppShell>;
}

function DashboardRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/dashboard/${user.role}`} replace />;
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-red-50 p-4">
      <ShieldCheck className="h-16 w-16 text-red-600 mb-6" />
      <h1 className="text-6xl font-black text-red-600 mb-2">404</h1>
      <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">The page you are looking for does not exist.</p>
      <div className="flex gap-3">
        <a href="/" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">Go Home</a>
        <a href="/login" className="px-4 py-2 border rounded-lg font-medium">Log In</a>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/dashboard" element={<DashboardRedirect />} />

      <Route path="/dashboard/student" element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/student/sos" element={<ProtectedRoute allowedRole="student"><StudentSOS /></ProtectedRoute>} />
      <Route path="/dashboard/student/safe-walk" element={<ProtectedRoute allowedRole="student"><StudentSafeWalk /></ProtectedRoute>} />
      <Route path="/dashboard/student/incidents" element={<ProtectedRoute allowedRole="student"><StudentIncidents /></ProtectedRoute>} />
      <Route path="/dashboard/student/alerts" element={<ProtectedRoute allowedRole="student"><StudentAlerts /></ProtectedRoute>} />
      <Route path="/dashboard/student/guardians" element={<ProtectedRoute allowedRole="student"><StudentGuardians /></ProtectedRoute>} />
      <Route path="/dashboard/student/notifications" element={<ProtectedRoute allowedRole="student"><StudentNotifications /></ProtectedRoute>} />
      <Route path="/dashboard/student/settings" element={<ProtectedRoute allowedRole="student"><StudentSettings /></ProtectedRoute>} />
      <Route path="/dashboard/student/profile" element={<ProtectedRoute allowedRole="student"><StudentProfile /></ProtectedRoute>} />

      <Route path="/dashboard/security" element={<ProtectedRoute allowedRole="security"><SecurityDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/security/alerts" element={<ProtectedRoute allowedRole="security"><SecurityAlerts /></ProtectedRoute>} />
      <Route path="/dashboard/security/safe-walks" element={<ProtectedRoute allowedRole="security"><SecuritySafeWalks /></ProtectedRoute>} />
      <Route path="/dashboard/security/incidents" element={<ProtectedRoute allowedRole="security"><SecurityIncidents /></ProtectedRoute>} />
      <Route path="/dashboard/security/broadcast" element={<ProtectedRoute allowedRole="security"><SecurityBroadcast /></ProtectedRoute>} />
      <Route path="/dashboard/security/users" element={<ProtectedRoute allowedRole="security"><SecurityUsers /></ProtectedRoute>} />
      <Route path="/dashboard/security/notifications" element={<ProtectedRoute allowedRole="security"><StudentNotifications /></ProtectedRoute>} />
      <Route path="/dashboard/security/settings" element={<ProtectedRoute allowedRole="security"><SecuritySettings /></ProtectedRoute>} />
      <Route path="/dashboard/security/profile" element={<ProtectedRoute allowedRole="security"><StudentProfile /></ProtectedRoute>} />

      <Route path="/dashboard/guardian" element={<ProtectedRoute allowedRole="guardian"><GuardianDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/guardian/tracking" element={<ProtectedRoute allowedRole="guardian"><GuardianTracking /></ProtectedRoute>} />
      <Route path="/dashboard/guardian/notifications" element={<ProtectedRoute allowedRole="guardian"><StudentNotifications /></ProtectedRoute>} />
      <Route path="/dashboard/guardian/settings" element={<ProtectedRoute allowedRole="guardian"><GuardianSettings /></ProtectedRoute>} />
      <Route path="/dashboard/guardian/profile" element={<ProtectedRoute allowedRole="guardian"><GuardianProfile /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
