import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TranslationProvider, useT } from './context/TranslationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Catches from './pages/Catches';
import Spots from './pages/Spots';
import Forecast from './pages/Forecast';
import Profile from './pages/Profile';
import Community from './pages/Community';
import License from './pages/License';
import Impressum from './pages/Impressum';
import Guidelines from './pages/Guidelines';
import Report from './pages/Report';
import Privacy from './pages/Privacy';
import Admin from './pages/Admin';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Footer from './components/Footer';
import UpdatePrompt from './components/UpdatePrompt';

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const { t } = useT();
  if (loading) return <div className="fullscreen-loading">{t('common.loading')}</div>;

  return (
    <Routes>
      <Route path="/auth"           element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email"   element={<VerifyEmail />} />
      <Route path="/" element={
        <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
      } />
      <Route path="/catches" element={
        <ProtectedRoute><Layout><Catches /></Layout></ProtectedRoute>
      } />
      <Route path="/spots" element={
        <ProtectedRoute><Layout><Spots /></Layout></ProtectedRoute>
      } />
      <Route path="/forecast" element={
        <ProtectedRoute><Layout><Forecast /></Layout></ProtectedRoute>
      } />
      <Route path="/community" element={
        <ProtectedRoute><Layout><Community /></Layout></ProtectedRoute>
      } />
      <Route path="/license" element={
        <ProtectedRoute><Layout><License /></Layout></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>
      } />
      <Route path="/impressum"   element={<Layout><Impressum /></Layout>} />
      <Route path="/guidelines" element={<Layout><Guidelines /></Layout>} />
      <Route path="/report"     element={<Layout><Report /></Layout>} />
      <Route path="/privacy"    element={<Layout><Privacy /></Layout>} />
      <Route path="/admin"      element={<AdminRoute><Layout><Admin /></Layout></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <UpdatePrompt />
      <AuthProvider>
        <TranslationProvider>
          <AppRoutes />
        </TranslationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
