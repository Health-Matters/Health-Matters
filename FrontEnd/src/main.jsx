import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router"; // 1. Import useNavigate
import "./index.css";
import RootLayout from "@/layout/root-layout.jsx";
import { LandingPage } from "./pages/Landing-page/LandingPage";
// Import Admin Dashboard
import AdminDashboardLayout from "./pages/DashBoards/AdminDashboard/admin-dashboard-layout.jsx";
import { TestFeature } from "./pages/DashBoards/AdminDashboard/test.jsx";
import { DebugAPI } from "./pages/DashBoards/AdminDashboard/debug-api.jsx";
import { TestOverview } from "./pages/DashBoards/AdminDashboard/test-overview.jsx";
import { TestAnalytics } from "./pages/DashBoards/AdminDashboard/test-analytics.jsx";
import { TestServices } from "./pages/DashBoards/AdminDashboard/test-services.jsx";
import TestDiary from "./pages/DashBoards/AdminDashboard/test-diary.jsx";
import { TestUsers } from "./pages/DashBoards/AdminDashboard/test-users.jsx";
import { TestSettings } from "./pages/DashBoards/AdminDashboard/test-settings.jsx";
// Import Employee Dashboard
import EmployeeDashboardLayout from "./pages/DashBoards/EmployeeDashboard/employee-dashboard-layout.jsx";
import { EmployeeOverview } from "./pages/DashBoards/EmployeeDashboard/EmployeeOverview.jsx";
import { EmployeeProfile } from "./pages/DashBoards/EmployeeDashboard/EmployeeProfile.jsx";
import { EmployeeProfileEdit } from "./pages/DashBoards/EmployeeDashboard/EmployeeProfileEdit.jsx";

// new pages for employee dashboard
import { SubmitReferral } from "./pages/DashBoards/EmployeeDashboard/SubmitReferral.jsx";
import { Notifications } from "./pages/DashBoards/EmployeeDashboard/Notifications.jsx";
import { HelpAndAdvice } from "./pages/DashBoards/EmployeeDashboard/HelpAndAdvice.jsx";
import { Accessibility } from "./pages/DashBoards/EmployeeDashboard/Accessibility.jsx";

// Import Practitioner Dashboard
import PractitionerDashboardLayout from "./pages/DashBoards/PractitionerDashboard/practitioner-dashboard-layout.jsx";
import { PractitionerTestOverview } from "./pages/DashBoards/PractitionerDashboard/test-overview.jsx";
import { PractitionerTestPatients } from "./pages/DashBoards/PractitionerDashboard/test-patients.jsx";
import { PractitionerTestReviews } from "./pages/DashBoards/PractitionerDashboard/test-reviews.jsx";
import { PractitionerTestProfile } from "./pages/DashBoards/PractitionerDashboard/test-profile.jsx";
import { PractitionerTestAppointments } from "./pages/DashBoards/PractitionerDashboard/test-appointments.jsx";
import { PractitionerTestCreateReferral } from './pages/DashBoards/PractitionerDashboard/test-create-referral.jsx';
// Import Manager Dashboard
import ManagerDashboardLayout from "./pages/DashBoards/ManagerDashboard/manager-dashboard-layout.jsx";
import {
  ManagerAccessibility,
  ManagerInsights,
  ManagerOverview,
  ManagerReferralSubmission,
  ManagerTeam,
} from "./pages/DashBoards/ManagerDashboard/manager-dashboard-content.jsx";
import { ManagerTestProfile } from "./pages/DashBoards/ManagerDashboard/test-profile.jsx";
import { ManagerTestBudget } from "./pages/DashBoards/ManagerDashboard/test-budget.jsx";
import { ClerkProvider } from "@clerk/clerk-react";
import { Provider } from "react-redux";
import SignInPage from "./pages/Login/sign-in.jsx";
import SignUpPage from "./pages/Login/sign-up.jsx";
import MainLayout from "./layout/main-layout.jsx";
import { ProtectedLayout } from "./layout/ProtectedLayout.jsx";
import { store } from "./store";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk publishable key in environment variables");
}

// 2. Create this wrapper component
const ClerkWithRoutes = () => {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      // 3. Connect Clerk to React Router here
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      // 4. Force redirects to root 
      signInForceRedirectUrl="/"
      signUpForceRedirectUrl="/"
    >
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>
          <Route element={<ProtectedLayout />}>
            {/* Admin Dashboard Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboardLayout />}>
              <Route index element={<TestOverview />} />
              <Route path="analytics" element={<TestAnalytics />} />
              <Route path="services" element={<TestServices />} />
              <Route path="referrals" element={<TestFeature />} />
              <Route path="debug" element={<DebugAPI />} />
              <Route path="diary" element={<TestDiary />} />
              <Route path="users" element={<TestUsers />} />
              <Route path="settings" element={<TestSettings />} />
            </Route>
            {/* Employee Dashboard Routes */}
            <Route path="/employee/dashboard" element={<EmployeeDashboardLayout />}>
              <Route index element={<EmployeeOverview />} />
              <Route path="profile" element={<EmployeeProfile />} />
              <Route path="/employee/dashboard/profile/edit" element={<EmployeeProfileEdit />} />
              <Route path="submit-referral" element={<SubmitReferral />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="help" element={<HelpAndAdvice />} />
              <Route path="accessibility" element={<Accessibility />} />
            </Route>
            {/* Practitioner Dashboard Routes */}
            <Route path="/practitioner/dashboard" element={<PractitionerDashboardLayout />}>
              <Route index element={<PractitionerTestOverview />} />
              <Route path="patients" element={<PractitionerTestPatients />} />
              <Route path="reviews" element={<PractitionerTestReviews />} />
              <Route path="appointments" element={<PractitionerTestAppointments />} />
              <Route path="profile" element={<PractitionerTestProfile />} />
              <Route path='create_referral' element={ <PractitionerTestCreateReferral /> } />
            </Route>
            {/* Manager Dashboard Routes */}
            <Route path="/manager/dashboard" element={<ManagerDashboardLayout />}>
              <Route index element={<ManagerOverview />} />  
              <Route path="team" element={<ManagerTeam />} />
              <Route path="referral" element={<ManagerReferralSubmission />} /> 
              <Route path="insights" element={<ManagerInsights />} />
              <Route path="budget" element={<ManagerTestBudget />} />
              <Route path="profile" element={<ManagerTestProfile />} />
              <Route path="accessibility" element={<ManagerAccessibility />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </ClerkProvider>
  );
};

// 5. Render BrowserRouter as the top-level parent
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ClerkWithRoutes />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);