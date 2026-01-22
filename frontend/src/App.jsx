// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';
import './styles.css'; 

// --- AUTH & LAYOUT COMPONENTS ---
import SignInScreen from './SignInScreen.jsx';
import ForgotPassword from './ForgotPassword.jsx'; 
import Dashboard from './Dashboard.jsx';

// --- CONTENT PAGE COMPONENT IMPORTS ---
import UploadContentPage from './pages/UploadContentPage.jsx';
// 🔑 IMPORT: Your newly renamed component
import ContentListPage from './pages/ContentListPage.jsx'; 
// 🔑 IMPORT: If you still have a separate Edit page for the form
import EditContentPage from './pages/EditContentPage.jsx'; 

// 🔑 IMPORT: User Management Page
import UserManagementPage from './pages/UserManagementPage.jsx';

// 🔑 IMPORT: Analytics Pages
import AnalyticsManagementPage from './pages/AnalyticsManagementPage.jsx';
import GenerateAnalyticsPage from './pages/GenerateAnalyticsPage.jsx';
import ViewAnalyticsPage from './pages/ViewAnalyticsPage.jsx';
import DownloadAnalyticsPage from './pages/DownloadAnalyticsPage.jsx';

// 🔑 IMPORT: Content Management Pages
import ApproveContentPage from './pages/ApproveContentPage.jsx';
import PublishContentPage from './pages/PublishContentPage.jsx';
import DeleteContentPage from './pages/DeleteContentPage.jsx';

// 🔑 REMOVED: Generic placeholder component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignInScreen />} />
        <Route path="/signin" element={<SignInScreen />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Nested Dashboard Route */}
        <Route path="/dashboard" element={<Dashboard />}>
          {/* Dashboard Index */}
          <Route index element={<h2 style={{ padding: '20px', fontWeight: 'normal' }}>Welcome! Select a section from the sidebar.</h2>} />

          {/* Content Management Sub-Routes */}
          <Route path="content/upload" element={<UploadContentPage />} />
          
          {/* 🔑 CHANGED: Edit placeholder replaced with Content List */}
          <Route path="content/list" element={<ContentListPage />} />
          
          {/* 🔑 ADDED: Route for the actual editing form (requires ID) */}
          <Route path="content/edit/:id" element={<EditContentPage />} />

          <Route path="content/approve" element={<ApproveContentPage />} />
          <Route path="content/publish" element={<PublishContentPage />} />
          <Route path="content/delete" element={<DeleteContentPage />} />

          {/* Analytics Management Sub-Routes */}
          <Route path="analytics/generate" element={<GenerateAnalyticsPage />} />
          <Route path="analytics/view" element={<ViewAnalyticsPage />} />
          <Route path="analytics/download" element={<DownloadAnalyticsPage />} />

          {/* User Management Sub-Routes */}
          <Route path="users" element={<UserManagementPage />} />

          {/* Catch-all for /dashboard/* pages */}
          <Route path="*" element={<h1 style={{ padding: '20px', fontWeight: 'normal' }}>404 Dashboard Content Not Found</h1>} />
        </Route>

        {/* General 404/Catch-all route */}
        <Route path="*" element={<h1 style={{ fontWeight: 'normal' }}>404 Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;