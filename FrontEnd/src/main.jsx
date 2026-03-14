import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router"; // 1. Import useNavigate
import "./index.css";

/*
 Backlog Traceability (Done Stories)
 Team A - Submit referral on behalf of a team member (TMA-001) . Done by Mahdi
 Team A - Add referral reason and supporting notes (TMA-002) . Done by Mahdi
 Team A - View submitted referrals with progress tracking (TMA-003) . Done by Mahdi
 Team A - View referral details and status updates (TMA-004) . Done by Mahdi
 Team A - Integrate manager referral backend endpoints (TMA-005) . Done by Savindu
 Team A - Deliver user-friendly and responsive referral workflow (TMA-006) . Done by Savindu and Mahdi

 Team B - Update manager personal details (TMB-005) . Done by Tevin and Ovin
 Team B - View health guidance documents and advice sheets (TMB-006) . Done by Tevin and Ovin

 Team C - Submit self-referral with validation (TMC-001) . Done by Vinuki and Senuthi, and Tharusha
 Team C - View referral history (TMC-002) . Done by Vinuki and Senuthi, and Tharusha
 Team C - View past and upcoming appointments (TMC-003) . Done by Vinuki and Senuthi, and Tharusha
 Team C - View service prices and durations (TMC-005) . Done by Vinuki and Senuthi
 Team C - View total referral activity count (TMC-006) . Done by Vinuki and Senuthi, and Tharusha
 Team C - View pending referrals indicator (TMC-007) . Done by Vinuki and Senuthi, and Tharusha

 Team D - Referral status change notifications for managers (TMD-001) . Done by Ramiru
 Team D - Cancel pending manager referrals (TMD-002) . Done by Sajana
 Team D - Aggregated team health overview analytics (TMD-003) . Done by Omidu
 Team D - SLA compliance statistics and escalation view (TMD-004) . Done by Sajana
 Team D - In-depth wellbeing analytics trends (TMD-005) . Done by Ramiru

 Team E - In-app notifications for appointments and outcomes (TME-001) . Done by Abhiman and Methmi
 Team E - Update user personal details (TME-002) . Done by Praneepa and Methmi
 Team E - Dashboard cards for upcoming appointments and advice activity (TME-003) . Done by Methmi

 Team F - Admin login and role management console access (TMF-001) . Done by Mirco and Danuja
 Team F - Filterable user list by role (TMF-002) . Done by Isuru and Upeka
 Team F - Create new user accounts (TMF-003) . Done by Mirco and Idusha
 Team F - Edit user details (TMF-004) . Done by Mirco and Danuja
 Team F - Centralized referral intake dashboard (TMF-005) . Done by Danuja and Isuru
 Team F - GDPR and ISO 27001 security compliance baseline (TMF-006) . Done by Mirco

 Team G - Practitioner appointment list access (TMG-001) . Done by Charin, Helika and Vinuli
 Team G - Practitioner-to-practitioner referral workflow (TMG-002) . Done by Vinuli
 Team G - Practitioner appointment cancellation workflow (TMG-003) . Done by Vinuli
 Team G - Practitioner appointment performance counters (TMG-004) . Done by Helika
 Team G - Unified practitioner referral management dashboard (TMG-005) . Done by Charin, Helika and Vinuli
 Team G - Practitioner profile details page (TMG-006) . Done by Helika

 Team H - View services table with operational filters (TMH-001) . Done by Piushan
 Team H - Create new service entries (TMH-002) . Done by Vishal
 Team H - Edit existing service details (TMH-003) . Done by Tenura
 Team H - Deactivate or archive services (TMH-004) . Done by Shamal
 Team H - Service summary KPI stats bar (TMH-005) . Done by Usara

 Team I - Help and advice page for referral guidance (TMI-001) . Done by Sasithi and Yovinma
 Team I - Employee referral list tracking view (TMI-002) . Done by Sasithi and Yovinma
 Team I - Referral status visibility badges (TMI-003) . Done by Sasithi and Yovinma
 Team I - Clinical summary view in referral details (TMI-004) . Done by Sasithi and Yovinma
 Team I - General wellbeing guidance while referrals are in progress (TMI-005) . Done by Sasithi and Yovinma

 Team J - View recent patient reviews dashboard cards (TMJ-001) . Done by Yahanima and Senithi
 Team J - Submit new patient reviews (TMJ-002) . Done by Irindu and Dulmin
 Team J - Star rating component for review scoring (TMJ-003) . Done by Akith and Yahanima
 Team J - Search patient records in practitioner view (TMJ-005) . Done by Senithi, Yahanima and Dulmin
 Team J - View patient details in modal popup (TMJ-006) . Done by Akith and Irindu
 Team J - Practitioner patient statistics cards (TMJ-007) . Done by Dulmin, Yahanima and Senithi
*/

import RootLayout from "@/layout/root-layout.jsx";
import { LandingPage } from "./pages/Landing-page/LandingPage";
// Import Admin Dashboard
import AdminDashboardLayout from "./pages/DashBoards/AdminDashboard/admin-dashboard-layout.jsx";
import { TestFeature } from "./pages/DashBoards/AdminDashboard/test.jsx";
import { DebugAPI } from "./pages/DashBoards/AdminDashboard/debug-api.jsx";
import { TestOverview } from "./pages/DashBoards/AdminDashboard/test-overview.jsx";
import { AnalyticsKPI } from "./pages/DashBoards/AdminDashboard/AnalyticsKPI.jsx";
import { ServiceManagement } from "./pages/DashBoards/AdminDashboard/ServiceManagement.jsx";
import { TestServices } from "./pages/DashBoards/AdminDashboard/test-services.jsx";
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
import { PractitionerReviewsLearnMore } from "./pages/DashBoards/PractitionerDashboard/test-reviews-learn-more.jsx";
import { PractitionerTestProfile } from "./pages/DashBoards/PractitionerDashboard/test-profile.jsx";
import { PractitionerAppointmentsLive } from "./pages/DashBoards/PractitionerDashboard/appointments-live.jsx";
import { PractitionerTestCreateReferral } from './pages/DashBoards/PractitionerDashboard/test-create-referral.jsx';
// Import Manager Dashboard
import ManagerDashboardLayout from "./pages/DashBoards/ManagerDashboard/manager-dashboard-layout.jsx";
import { ManagerOverview, ManagerReferralSubmission } from "./pages/DashBoards/ManagerDashboard/manager-dashboard-pages.jsx";
import { ManagerTestTeam } from "./pages/DashBoards/ManagerDashboard/test-team.jsx";
import { ManagerTestInsights } from "./pages/DashBoards/ManagerDashboard/test-insights.jsx";
import { ManagerTestProfile } from "./pages/DashBoards/ManagerDashboard/test-profile.jsx";
import { ManagerTestBudget } from "./pages/DashBoards/ManagerDashboard/test-budget.jsx";
import { ManagerAccessibility } from "./pages/DashBoards/ManagerDashboard/manager-accessibility.jsx";
import { ClerkProvider } from "@clerk/clerk-react";
import { Provider } from "react-redux";
import SignInPage from "./pages/Login/sign-in.jsx";
import SignUpPage from "./pages/Login/sign-up.jsx";
import MainLayout from "./layout/main-layout.jsx";
import { ProtectedLayout } from "./layout/ProtectedLayout.jsx";
import { store } from "./store";
import { ThemeSync } from "./components/theme-sync.jsx";

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
              <Route path="analytics" element={<AnalyticsKPI />} />
              <Route path="services" element={<ServiceManagement />} />
              <Route path="referrals" element={<TestFeature />} />
              <Route path="debug" element={<DebugAPI />} />
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
              <Route path="reviews/learn-more" element={<PractitionerReviewsLearnMore />} />
              <Route path="appointments" element={<PractitionerAppointmentsLive />} />
              <Route path="profile" element={<PractitionerTestProfile />} />
              <Route path='create_referral' element={ <PractitionerTestCreateReferral /> } />
            </Route>
            {/* Manager Dashboard Routes */}
            <Route path="/manager/dashboard" element={<ManagerDashboardLayout />}>
              <Route index element={<ManagerOverview />} />  
              <Route path="team" element={<ManagerTestTeam />} />
              <Route path="referral" element={<ManagerReferralSubmission />} /> 
              <Route path="insights" element={<ManagerTestInsights />} />
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
      <ThemeSync />
      <BrowserRouter>
        <ClerkWithRoutes />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);