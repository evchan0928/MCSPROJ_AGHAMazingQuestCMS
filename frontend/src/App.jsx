// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';
import './styles.css'; 

// --- AUTH & LAYOUT COMPONENTS ---
import SignInScreen from './SignInScreen.jsx';
import ForgotPassword from './ForgotPassword.jsx'; 
import Dashboard from './Dashboard.jsx';

// --- CONTENT PAGE COMPONENT IMPORTS ---
import UploadContentPage from './pages/UploadContentPage.js';
// 🔑 IMPORT: Your newly renamed component
import ContentListPage from './pages/ContentListPage.js'; 
// 🔑 IMPORT: If you still have a separate Edit page for the form
import EditContentPage from './pages/ContentListPage.js'; 

// 🔑 FIX: Define the generic placeholder
const PlaceholderPage = ({ name }) => <h1>{name} Page Content</h1>;

// 🔑 UPDATED: Removed the Placeholder for EditContent since we are importing the real ones
const ApproveContentPage = () => <PlaceholderPage name="Approve Content" />;
const PublishContentPage = () => <PlaceholderPage name="Publish Content" />;
const DeleteContentPage = () => <PlaceholderPage name="Delete Content" />;
const GenerateAnalyticsPage = () => <PlaceholderPage name="Generate Analytics" />;
const ViewAnalyticsPage = () => <PlaceholderPage name="View Analytics" />;
const DownloadAnalyticsPage = () => <PlaceholderPage name="Download Analytics" />;
const UserManagementPage = () => <PlaceholderPage name="User Management" />;
const RolesPage = () => <PlaceholderPage name="User Roles" />;

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
          <Route path="users/roles" element={<RolesPage />} />

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