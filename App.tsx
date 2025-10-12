import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CharacterSheetPage from './pages/CharacterSheetPage';
import GrimoirePage from './pages/GrimoirePage';

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
      <div className="flex items-center justify-center min-h-screen bg-[#FBF3E5]">
        <div className="text-2xl font-title text-[#2D3748]">Loading...</div>
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
        <Route path="/character/:id" element={user ? <CharacterSheetPage /> : <LoginPage />} />
        <Route path="/grimoire/:id" element={user ? <GrimoirePage /> : <LoginPage />} />
        <Route path="/" element={user ? <DashboardPage /> : <LoginPage />} />
        {/* Fallback for any other route */}
        <Route path="*" element={user ? <DashboardPage /> : <LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;