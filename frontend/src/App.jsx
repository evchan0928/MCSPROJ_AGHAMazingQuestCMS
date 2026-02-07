import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';
import SignInScreen from './SignInScreen.jsx';
import UploadContentPage from './pages/UploadContentPage.jsx';
import ContentListPage from './pages/ContentListPage.jsx';
import ApproveContentPage from './pages/ApproveContentPage.jsx';
import PublishContentPage from './pages/PublishContentPage.jsx';
import PublishedContentPage from './pages/PublishedContentPage.jsx';
import ContentManagementPage from './pages/ContentManagementPage.jsx';
import UserManagementPage from './pages/UserManagementPage.jsx';
import EditContentPage from './pages/EditContentPage.jsx';
import ContentDetailPage from './pages/ContentDetailPage.jsx';
import GenerateAnalyticsPage from './pages/GenerateAnalyticsPage.jsx';
import ViewAnalyticsPage from './pages/ViewAnalyticsPage.jsx';
import DownloadAnalyticsPage from './pages/DownloadAnalyticsPage.jsx';
import RolesPage from './pages/RolesPage.jsx';  // Import the RolesPage component
import { getCurrentUser } from './api/django-api';

// Private route component to protect routes that require authentication
const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Attempt to get the current user to verify authentication
        await getCurrentUser();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // While checking authentication status, show a loading indicator
  if (checkingAuth) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#333'
      }}>
        Loading...
      </div>
    );
  }

  // If authenticated, render the protected component; otherwise, redirect to sign-in
  return isAuthenticated ? children : <Navigate to="/signin" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignInScreen />} />
        
        {/* Protected routes */}
        <Route path="/dashboard/*" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }>
          {/* Nested routes for dashboard */}
          <Route index element={
            <PrivateRoute>
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <h2>Welcome to the Dashboard</h2>
                <p>Select an option from the sidebar to get started.</p>
              </div>
            </PrivateRoute>
          } />
          
          <Route path="content/upload" element={
            <PrivateRoute>
              <UploadContentPage />
            </PrivateRoute>
          } />
          
          <Route path="content/list" element={
            <PrivateRoute>
              <ContentListPage />
            </PrivateRoute>
          } />
          
          <Route path="content/edit/:id" element={
            <PrivateRoute>
              <EditContentPage />
            </PrivateRoute>
          } />
          
          <Route path="content/detail/:id" element={
            <PrivateRoute>
              <ContentDetailPage />
            </PrivateRoute>
          } />
          
          <Route path="content/approve" element={
            <PrivateRoute>
              <ApproveContentPage />
            </PrivateRoute>
          } />
          
          <Route path="content/publish" element={
            <PrivateRoute>
              <PublishContentPage />
            </PrivateRoute>
          } />
          
          <Route path="content/published" element={
            <PrivateRoute>
              <PublishedContentPage />
            </PrivateRoute>
          } />
          
          <Route path="content/delete" element={
            <PrivateRoute>
              <ContentManagementPage />
            </PrivateRoute>
          } />
          
          <Route path="analytics/generate" element={
            <PrivateRoute>
              <GenerateAnalyticsPage />
            </PrivateRoute>
          } />
          
          <Route path="analytics/view" element={
            <PrivateRoute>
              <ViewAnalyticsPage />
            </PrivateRoute>
          } />
          
          <Route path="analytics/download" element={
            <PrivateRoute>
              <DownloadAnalyticsPage />
            </PrivateRoute>
          } />
          
          <Route path="users" element={
            <PrivateRoute>
              <UserManagementPage />
            </PrivateRoute>
          } />
          
          <Route path="users/roles" element={
            <PrivateRoute>
              <RolesPage />
            </PrivateRoute>
          } />
        </Route>
        
        {/* Catch-all route for undefined paths */}
        <Route path="*" element={
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '18px',
            color: '#333'
          }}>
            <div>
              <h2>404 - Page Not Found</h2>
              <p>The page you are looking for does not exist.</p>
              <a href="/dashboard">Go to Dashboard</a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;