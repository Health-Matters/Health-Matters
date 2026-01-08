import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import './index.css'
import RootLayout from '@/layout/root-layout.jsx';
import { LandingPage } from './pages/Landing-page/LandingPage';
// import AdminDashboard from './pages/DashBoards/AdminDashboard/admin-dashboard';
import { Test } from './pages/DashBoards/AdminDashboard/test';
import HealthMattersDashboard from './pages/DashBoards/AdminDashboard/admin-dashboard';
import { ClerkProvider } from '@clerk/clerk-react';
import SignInPage from './pages/Login/sign-in.jsx';
import SignUpPage from './pages/Login/sign-up.jsx';

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
          <Route path='/' element={<LandingPage />} />
          <Route path='/admin/dashboard' element={ <HealthMattersDashboard /> } />
        </Route>
      </Routes>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>
)
