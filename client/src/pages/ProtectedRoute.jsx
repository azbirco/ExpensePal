import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  // Kung walang token, ibalik sa login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Kung may token, ipakita ang mga pages (Dashboard/Expenses)
  return children;
};

export default ProtectedRoute;