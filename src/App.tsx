import React, { Suspense, lazy, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/common/AuthModal';
import { OnboardingModal } from './components/auth/OnboardingModal';
import { PageLoadingFallback } from './components/common/PageLoadingFallback';

// Route-level code splitting: pages load on-demand rather than bloating initial bundle
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const WeekendsPage = lazy(() => import('./pages/WeekendsPage').then(m => ({ default: m.WeekendsPage })));
const WeekendDashboardPage = lazy(() => import('./pages/WeekendDashboardPage').then(m => ({ default: m.WeekendDashboardPage })));
const PredictionsHubPage = lazy(() => import('./pages/PredictionsHubPage').then(m => ({ default: m.PredictionsHubPage })));
const PredictionPage = lazy(() => import('./pages/PredictionPage').then(m => ({ default: m.PredictionPage })));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const LearnPage = lazy(() => import('./pages/LearnPage').then(m => ({ default: m.LearnPage })));
const CircuitsPage = lazy(() => import('./pages/CircuitsPage').then(m => ({ default: m.CircuitsPage })));
const ChampionshipsPage = lazy(() => import('./pages/ChampionshipsPage').then(m => ({ default: m.ChampionshipsPage })));
const ChampionshipDetailPage = lazy(() => import('./pages/ChampionshipDetailPage').then(m => ({ default: m.ChampionshipDetailPage })));
const IndianMotorsportPage = lazy(() => import('./pages/IndianMotorsportPage').then(m => ({ default: m.IndianMotorsportPage })));
const UniversalSearchModal = lazy(() => import('./components/search/UniversalSearchModal').then(m => ({ default: m.UniversalSearchModal })));

const AppLayout: React.FC = () => {
  const { searchOpen, closeSearch, toggleSearch } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSearch]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/schedule" element={<WeekendsPage />} />
            <Route path="/races" element={<WeekendsPage />} />
            <Route path="/races/:round" element={<WeekendDashboardPage />} />
            <Route path="/weekends" element={<WeekendsPage />} />
            <Route path="/weekends/:raceWeekendId" element={<WeekendDashboardPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/circuits" element={<CircuitsPage />} />
            <Route path="/circuits/:circuitId" element={<CircuitsPage />} />
            <Route path="/championships" element={<ChampionshipsPage />} />
            <Route path="/championships/:championshipId" element={<ChampionshipDetailPage />} />
            <Route path="/indian-motorsport" element={<IndianMotorsportPage />} />
            <Route path="/explore" element={<ChampionshipsPage />} />
            <Route path="/predictions" element={<PredictionsHubPage />} />
            <Route path="/predict/:roundId" element={<PredictionPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/race-weekends" element={<AdminDashboardPage />} />
            <Route path="/admin/results" element={<AdminDashboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <ToastContainer />
      <AuthModal />
      <OnboardingModal />
      {searchOpen && (
        <Suspense fallback={null}>
          <UniversalSearchModal isOpen={searchOpen} onClose={closeSearch} />
        </Suspense>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AuthProvider>
        <HashRouter>
          <AppLayout />
        </HashRouter>
      </AuthProvider>
    </AppProvider>
  );
};

export default App;
