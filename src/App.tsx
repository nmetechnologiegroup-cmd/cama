/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { LanguageProvider } from './lib/LanguageContext';
import { ThemeProvider } from './lib/ThemeContext';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Services from './pages/Services';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Contact from './pages/Contact';
import Vision from './pages/Vision';
import RGPD from './pages/RGPD';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDossiers from './pages/admin/AdminDossiers';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCentres from './pages/admin/AdminCentres';
import AdminNews from './pages/admin/AdminNews';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSiteWeb from './pages/admin/AdminSiteWeb';
import AdminChat from './pages/admin/AdminChat';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public & Assuré Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/vision" element={<Vision />} />
              <Route path="/rgpd" element={<RGPD />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="site" element={<AdminSiteWeb />} />
              <Route path="chat" element={<AdminChat />} />
              <Route path="dossiers" element={<AdminDossiers />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="centres" element={<AdminCentres />} />
              <Route path="news" element={<AdminNews />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}
