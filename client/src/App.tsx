import { Routes, Route, Navigate, Link, Outlet } from "react-router-dom";
import Landing from "./Landing";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import InsightsPage from "./pages/InsightsPage";
import JournalPage from "./pages/JournalPage";
import { MoodHistoryProvider } from "./context/MoodHistoryContext";
function ProtectedRoute() {
  const { user, loading, error, refresh, logout } = useAuth();
  if (loading)
    return (
      <div id="main-content" role="main" tabIndex={-1} className="session-state">
        <p role="status">Growing your little sanctuary…</p>
      </div>
    );
  if (error)
    return (
      <div id="main-content" role="main" tabIndex={-1} className="session-state">
        <p role="alert">{error}</p>
        <button className="primary-button" onClick={() => void refresh()}>
          Try again
        </button>
        <button className="text-button" onClick={logout}>
          Back to login
        </button>
      </div>
    );
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
export default function App() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <AuthProvider>
        <MoodHistoryProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/insights" element={<InsightsPage />} />
            </Route>
            <Route
              path="*"
              element={
                <div id="main-content" role="main" tabIndex={-1} className="session-state">
                  <p>This little path hasn't been planted yet.</p>
                  <Link to="/">Back to the garden</Link>
                </div>
              }
            />
          </Routes>
        </MoodHistoryProvider>
      </AuthProvider>
    </>
  );
}
