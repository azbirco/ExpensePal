import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages - Case-sensitive base sa structure mo
import LoginPage from './pages/LoginPage.jsx'; 
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx'; // IN-IMPORT NATIN ITO
import Dashboard from './pages/Dashboard.jsx';
import Expenses from './pages/Expenses.jsx';
import Savings from './pages/Savings.jsx';
import Archive from './pages/Archive.jsx';
import Sidebar from './pages/Sidebar.jsx';
import Reports from './pages/Reports.jsx'; 

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      {/* Background color base sa iyong dashboard theme */}
      <div className="flex bg-[#001B3D] min-h-screen font-sans">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> {/* DINAGDAG NA ROUTE */}
          
          {/* Protected Routes Wrapper */}
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="flex w-full">
                <Sidebar /> 
                <div className="flex-1 overflow-y-auto">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/expenses" element={<Expenses />} />
                    <Route path="/savings" element={<Savings />} />
                    <Route path="/reports" element={<Reports />} /> 
                    <Route path="/archive" element={<Archive />} />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    
                    {/* Catch-all para sa mga maling URL sa loob ng protected area */}
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;