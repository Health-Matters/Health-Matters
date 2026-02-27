import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import './index.css'
import RootLayout from '@/layout/root-layout.jsx';
import { LandingPage } from './pages/Landing-page/LandingPage';
// Import Admin Dashboard 
import AdminDashboardLayout from './pages/DashBoards/AdminDashboard/admin-dashboard-layout.jsx';
import { TestFeature } from './pages/DashBoards/AdminDashboard/test.jsx';
import { TestOverview } from './pages/DashBoards/AdminDashboard/test-overview.jsx';
import { TestAnalytics } from './pages/DashBoards/AdminDashboard/test-analytics.jsx';
import TestDiary from './pages/DashBoards/AdminDashboard/test-diary.jsx';
import { TestUsers } from './pages/DashBoards/AdminDashboard/test-users.jsx';
import { TestSettings } from './pages/DashBoards/AdminDashboard/test-settings.jsx';
// Import Employee Dashboard
import EmployeeDashboardLayout from './pages/DashBoards/EmployeeDashboard/employee-dashboard-layout.jsx';
import { EmployeeTestOverview } from './pages/DashBoards/EmployeeDashboard/test-overview.jsx';
import { EmployeeTestTasks } from './pages/DashBoards/EmployeeDashboard/test-tasks.jsx';
import { EmployeeTestReports } from './pages/DashBoards/EmployeeDashboard/test-reports.jsx';
import { EmployeeTestProfile } from './pages/DashBoards/EmployeeDashboard/test-profile.jsx';
import { EmployeeTestSchedule } from './pages/DashBoards/EmployeeDashboard/test-schedule.jsx';
// Import Practitioner Dashboard
import PractitionerDashboardLayout from './pages/DashBoards/PractitionerDashboard/practitioner-dashboard-layout.jsx';
import { PractitionerTestOverview } from './pages/DashBoards/PractitionerDashboard/test-overview.jsx';
import { PractitionerTestPatients } from './pages/DashBoards/PractitionerDashboard/test-patients.jsx';
import { PractitionerTestReviews } from './pages/DashBoards/PractitionerDashboard/test-reviews.jsx';
import { PractitionerTestProfile } from './pages/DashBoards/PractitionerDashboard/test-profile.jsx';
import { PractitionerTestAppointments } from './pages/DashBoards/PractitionerDashboard/test-appointments.jsx';
// Import Manager Dashboard
import ManagerDashboardLayout from './pages/DashBoards/ManagerDashboard/manager-dashboard-layout.jsx';
import { ManagerTestOverview } from './pages/DashBoards/ManagerDashboard/test-overview.jsx';
import { ManagerTestTeam } from './pages/DashBoards/ManagerDashboard/test-team.jsx';
import { ManagerTestInsights } from './pages/DashBoards/ManagerDashboard/test-insights.jsx';
import { ManagerTestProfile } from './pages/DashBoards/ManagerDashboard/test-profile.jsx';
import { ManagerTestBudget } from './pages/DashBoards/ManagerDashboard/test-budget.jsx';
import { ClerkProvider } from '@clerk/clerk-react';
import SignInPage from './pages/Login/sign-in.jsx';
import SignUpPage from './pages/Login/sign-up.jsx';
import  MainLayout  from './layout/main-layout.jsx';
import { ProtectedLayout } from './layout/ProtectedLayout.jsx';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk publishable key in environment variables");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Routes>
        <Route element={<RootLayout />}>
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/sign-up" element={<SignUpPage />} />
          <Route element={<MainLayout />}>
          <Route path='/' element={<LandingPage />} />
          </Route>
          <Route path='/dashboard' element={<ProtectedLayout />} />
          // Admin Dashboard Routes
          <Route path='/admin/dashboard' element={ <AdminDashboardLayout /> }>
            <Route index element={ <TestOverview /> } />
            <Route path='analytics' element={ <TestAnalytics /> } />
            <Route path='referrals' element={ <TestFeature /> } />
            <Route path='diary' element={ <TestDiary /> } />
            <Route path='users' element={ <TestUsers /> } />
            <Route path='settings' element={ <TestSettings /> } />
          </Route>
          // Employee Dashboard Routes
          <Route path='/employee/dashboard' element={ <EmployeeDashboardLayout /> }>
            <Route index element={ <EmployeeTestOverview /> } />
            <Route path='tasks' element={ <EmployeeTestTasks /> } />
            <Route path='reports' element={ <EmployeeTestReports /> } />
            <Route path='schedule' element={ <EmployeeTestSchedule /> } />
            <Route path='profile' element={ <EmployeeTestProfile /> } />
          </Route>
          // Practitioner Dashboard Routes
          <Route path='/practitioner/dashboard' element={ <PractitionerDashboardLayout /> }>
            <Route index element={ <PractitionerTestOverview /> } />
            <Route path='patients' element={ <PractitionerTestPatients /> } />
            <Route path='reviews' element={ <PractitionerTestReviews /> } />
            <Route path='appointments' element={ <PractitionerTestAppointments /> } />
            <Route path='profile' element={ <PractitionerTestProfile /> } />
          </Route>
          // Manager Dashboard Routes
          <Route path='/manager/dashboard' element={ <ManagerDashboardLayout /> }>
            <Route index element={ <ManagerTestOverview /> } />
            <Route path='team' element={ <ManagerTestTeam /> } />
            <Route path='insights' element={ <ManagerTestInsights /> } />
            <Route path='budget' element={ <ManagerTestBudget /> } />
            <Route path='profile' element={ <ManagerTestProfile /> } />
          </Route>
        </Route>
      </Routes>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>
)
