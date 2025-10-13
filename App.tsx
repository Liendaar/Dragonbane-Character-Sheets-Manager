import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CharacterSheetPage from './pages/CharacterSheetPage';
import GrimoirePage from './pages/GrimoirePage';
import AbilitiesPage from './pages/AbilitiesPage';
import NotesPage from './pages/NotesPage';
import ProfilePage from './pages/ProfilePage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
};

const Router: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a1a1a]">
        <div className="text-2xl font-title text-[#e5e5e5]">Loading...</div>
      </div>
    );
  }

  // The original implementation using <Navigate> caused errors in sandboxed environments.
  // This new implementation uses conditional rendering to show the correct page
  // based on authentication state, which avoids the programmatic navigation error.
  return (
    <BrowserRouter basename="/Dragonbane-Character-Sheets-Manager">
      <Routes>
        <Route path="/login" element={user ? <DashboardPage /> : <LoginPage />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <LoginPage />} />
        <Route path="/character/:id" element={user ? <CharacterSheetPage /> : <LoginPage />} />
        <Route path="/grimoire/:id" element={user ? <GrimoirePage /> : <LoginPage />} />
        <Route path="/abilities/:id" element={user ? <AbilitiesPage /> : <LoginPage />} />
        <Route path="/notes/:id" element={user ? <NotesPage /> : <LoginPage />} />
        <Route path="/" element={user ? <DashboardPage /> : <LoginPage />} />
        {/* Fallback for any other route */}
        <Route path="*" element={user ? <DashboardPage /> : <LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;