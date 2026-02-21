import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    // Redirect to signin if no token exists
    return <Navigate to="/signin" replace />;
  }
  
  // Render the protected component if token exists
  return children;
};

export default ProtectedRoute;