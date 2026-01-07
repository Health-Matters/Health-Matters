import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import './index.css'
import RootLayout from '@/layout/root-layout.jsx';
import { LandingPage } from '@/pages/Landing-page/landing-page.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path='/' element={<LandingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
