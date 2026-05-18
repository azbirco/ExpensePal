import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { Toaster } from 'react-hot-toast';

// Pages
import LoginPage from './pages/LoginPage';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Savings from './pages/Savings';
import Archive from './pages/Archive';
import Reports from './pages/Reports';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Profile from './pages/Profile';
import Admin from './pages/Admin'; // IN-IMPORT ANG ADMIN PAGE

// Components
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="bg-[#001B3D] min-h-screen font-sans text-slate-200 selection:bg-cyan-400/30">

        {/* CYBERPUNK TOAST SYSTEM */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={12}
          toastOptions={{
            duration: 3500,

            style: {
              background: 'rgba(5, 25, 46, 0.95)',
              color: '#ffffff',
              border:
                '1px solid rgba(34, 211, 238, 0.15)',
              borderRadius: '22px',
              padding: '16px 18px',
              fontWeight: '800',
              fontSize: '13px',
              letterSpacing: '0.03em',
              backdropFilter: 'blur(18px)',
              boxShadow:
                '0 0 40px rgba(34,211,238,0.12)',
            },

            success: {
              iconTheme: {
                primary: '#22d3ee',
                secondary: '#05192e',
              },

              style: {
                border:
                  '1px solid rgba(34,211,238,0.25)',
              },
            },

            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#05192e',
              },

              style: {
                border:
                  '1px solid rgba(239,68,68,0.25)',
              },
            },
          }}
        />

        <Routes>

          {/* PUBLIC ROUTES */}
          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          {/* PROTECTED ROUTES */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>

                <div className="flex min-h-screen overflow-hidden">

                  {/* SIDEBAR */}
                  <Sidebar />

                  {/* MAIN CONTENT */}
                  <main className="flex-1 h-screen overflow-y-auto bg-navy-900/50 custom-scrollbar">

                    <Routes>

                      <Route
                        path="/dashboard"
                        element={<Dashboard />}
                      />

                      <Route
                        path="/expenses"
                        element={<Expenses />}
                      />

                      <Route
                        path="/savings"
                        element={<Savings />}
                      />

                      <Route
                        path="/events"
                        element={<Events />}
                      />

                      <Route
                        path="/events/:id"
                        element={<EventDetails />}
                      />

                      <Route
                        path="/reports"
                        element={<Reports />}
                      />

                      <Route
                        path="/archive"
                        element={<Archive />}
                      />

                      <Route
                        path="/profile"
                        element={<Profile />}
                      />

                      {/* ADMIN ROUTE - Dito inilagay para makuha ang layout (Sidebar + Main) */}
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute adminOnly={true}>
                            <Admin />
                          </ProtectedRoute>
                        }
                      />

                      {/* DEFAULT REDIRECTS */}
                      <Route
                        path="/"
                        element={
                          <Navigate
                            to="/dashboard"
                            replace
                          />
                        }
                      />

                      <Route
                        path="*"
                        element={
                          <Navigate
                            to="/dashboard"
                            replace
                          />
                        }
                      />

                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;