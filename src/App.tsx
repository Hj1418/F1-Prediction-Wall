import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { UserSwitcherModal } from './components/common/UserSwitcherModal';

import { HomePage } from './pages/HomePage';
import { WeekendsPage } from './pages/WeekendsPage';
import { WeekendDashboardPage } from './pages/WeekendDashboardPage';
import { PredictionPage } from './pages/PredictionPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AuthProvider>
        <HashRouter>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/weekends" element={<WeekendsPage />} />
                <Route path="/weekends/:raceWeekendId" element={<WeekendDashboardPage />} />
                <Route path="/predict/:roundId" element={<PredictionPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/profile/:username" element={<ProfilePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/race-weekends" element={<AdminDashboardPage />} />
                <Route path="/admin/results" element={<AdminDashboardPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <ToastContainer />
            <UserSwitcherModal />
          </div>
        </HashRouter>
      </AuthProvider>
    </AppProvider>
  );
};

export default App;
