import { AnimatePresence } from 'framer-motion';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Loader } from './components/ui/Loader';
import { BreakReminder } from './components/ui/BreakReminder';
import { DataWarpBackground } from './components/ui/DataWarpBackground';
import { useAuth } from './context/AuthContext';

const AuthPage = lazy(() => import('./pages/AuthPage').then((module) => ({ default: module.AuthPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const LandingPage = lazy(() => import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })));
const LearningScenePage = lazy(() => import('./pages/LearningScenePage').then((module) => ({ default: module.LearningScenePage })));

function FullscreenLoader() {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center">
      <Loader label="Loading NeuroVerse" sublabel="Preparing your futuristic learning workspace..." size="lg" />
    </div>
  );
}

function App() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const [showBreakReminder, setShowBreakReminder] = useState(false);

  useEffect(() => {
    // 2 Hour timer logic
    const timer = setTimeout(() => {
      setShowBreakReminder(true);
    }, 2 * 60 * 60 * 1000);

    // Hackathon test helper
    window.triggerBreak = () => setShowBreakReminder(true);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <FullscreenLoader />;
  }

  return (
    <>
      <DataWarpBackground />
      <Suspense fallback={<FullscreenLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
          <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn"
            element={
              <ProtectedRoute>
                <LearningScenePage />
              </ProtectedRoute>
            }
          />
        </Routes>
        </AnimatePresence>
        <BreakReminder 
          isOpen={showBreakReminder} 
          onContinue={() => setShowBreakReminder(false)} 
          onTakeBreak={() => setShowBreakReminder(false)} 
        />
      </Suspense>
    </>
  );
}

export default App;
