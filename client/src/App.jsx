import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

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

// Components
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="bg-[#001B3D] min-h-screen font-sans text-slate-200 selection:bg-cyan-400/30">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected Routes Layout */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <div className="flex min-h-screen overflow-hidden">
                  {/* Sidebar Navigation */}
                  <Sidebar /> 
                  
                  {/* Main Content Area */}
                  <main className="flex-1 h-screen overflow-y-auto bg-navy-900/50 custom-scrollbar">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/expenses" element={<Expenses />} />
                      <Route path="/savings" element={<Savings />} />
                      <Route path="/events" element={<Events />} />
                      <Route path="/events/:id" element={<EventDetails />} />
                      <Route path="/reports" element={<Reports />} /> 
                      <Route path="/archive" element={<Archive />} />
                      
                      {/* Default redirects */}
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
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