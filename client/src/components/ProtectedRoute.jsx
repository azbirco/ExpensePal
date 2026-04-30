import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  // Kung walang token, ibalik sa login screen
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Kung authorized (may token), ipakita ang hiniling na page
  return children;
};

export default ProtectedRoute;