import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import './index.css'
import RootLayout from '@/layout/root-layout.jsx';
import { LandingPage } from './pages/Landing-page/LandingPage';
// import AdminDashboard from './pages/DashBoards/AdminDashboard/admin-dashboard';
import { Test } from './pages/DashBoards/AdminDashboard/test';
import HealthMattersDashboard from './pages/DashBoards/AdminDashboard/admin-dashboard';



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path='/' element={<LandingPage />} />
          <Route path='/admin/dashboard' element={ <HealthMattersDashboard /> } />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
