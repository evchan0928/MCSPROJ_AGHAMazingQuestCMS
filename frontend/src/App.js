import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from 'antd';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './Dashboard';
import ContentListPage from './pages/ContentListPage';
import UploadContentPage from './pages/UploadContentPage';
import EditContentPage from './pages/EditContentPage';
import ApproveContentPage from './pages/ApproveContentPage';
import PublishContentPage from './pages/PublishContentPage';
import UserManagementPage from './pages/UserManagementPage';
import AnalyticsManagementPage from './pages/AnalyticsManagementPage';
import RolesPage from './pages/RolesPage';
import SignInScreen from './SignInScreen';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './Profile';
import MobileManagementPage from './pages/mobile/MobileManagementPage'; // Changed to the new MobileManagementPage
import UserProfilesPage from './pages/mobile/UserProfilesPage';
import UserSessionsPage from './pages/mobile/UserSessionsPage';
import ScoresPage from './pages/mobile/ScoresPage';
import BadgesPage from './pages/mobile/BadgesPage';
import LeaderboardsPage from './pages/mobile/LeaderboardPage'; // Changed from LeaderboardsPage to LeaderboardPage
import PlayerStatsPage from './pages/mobile/PlayerStatsPage';
import ChatbotFeedbackPage from './pages/mobile/ChatbotFeedbackPage';
import CoinTransactionsPage from './pages/mobile/CoinTransactionsPage';
import UsersPage from './pages/mobile/UsersPage';
import AccountSettingsPage from './pages/AccountSettingsPage'; // Import the new account settings page

const { Content, Sider } = Layout;

function AppLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isAuthRoute = location.pathname === '/' || location.pathname === '/signin';

  const toggleSider = () => {
    setCollapsed(!collapsed);
  };

  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/" element={<SignInScreen />} />
        <Route path="/signin" element={<SignInScreen />} />
      </Routes>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        width={280} 
        collapsible 
        collapsed={collapsed} 
        onCollapse={toggleSider}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <Sidebar collapsed={collapsed} />
      </Sider>

      <Layout className="site-layout" style={{ marginLeft: collapsed ? 80 : 280 }}>
        <Navbar collapsed={collapsed} onToggle={toggleSider} />
        
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#fff' }}>
          <Routes>
              
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard/content/list" 
                element={
                  <ProtectedRoute>
                    <ContentListPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard/content/upload" 
                element={
                  <ProtectedRoute>
                    <UploadContentPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard/content/list" 
                element={
                  <ProtectedRoute>
                    <ContentListPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard/content/edit/:id" 
                element={
                  <ProtectedRoute>
                    <EditContentPage />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/dashboard/content/edit" 
                element={
                  <ProtectedRoute>
                    <EditContentPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard/content/approval" 
                element={
                  <ProtectedRoute>
                    <ApproveContentPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard/content/publish" 
                element={
                  <ProtectedRoute>
                    <PublishContentPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard/users/list" 
                element={
                  <ProtectedRoute>
                    <UserManagementPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard/users/roles" 
                element={
                  <ProtectedRoute>
                    <RolesPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard/analytics" 
                element={
                  <ProtectedRoute>
                    <AnalyticsManagementPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Mobile Management Routes */}
              <Route 
                path="/dashboard/mobile" 
                element={
                  <ProtectedRoute>
                    <MobileManagementPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/mobile/player-stats" 
                element={
                  <ProtectedRoute>
                    <PlayerStatsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/mobile/chatbot-feedback" 
                element={
                  <ProtectedRoute>
                    <ChatbotFeedbackPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/mobile/coin-transactions" 
                element={
                  <ProtectedRoute>
                    <CoinTransactionsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard/mobile/profiles" 
                element={
                  <ProtectedRoute>
                    <UserProfilesPage />
                  </ProtectedRoute>
                } 
              />
             
              <Route 
                path="/dashboard/mobile/users" 
                element={
                  <ProtectedRoute>
                    <UsersPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard/mobile/sessions" 
                element={
                  <ProtectedRoute>
                    <UserSessionsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard/mobile/scores" 
                element={
                  <ProtectedRoute>
                    <ScoresPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard/mobile/badges" 
                element={
                  <ProtectedRoute>
                    <BadgesPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard/mobile/leaderboards" 
                element={
                  <ProtectedRoute>
                    <LeaderboardsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Account Settings Route */}
              <Route 
                path="/dashboard/account-settings" 
                element={
                  <ProtectedRoute>
                    <AccountSettingsPage />
                  </ProtectedRoute>
                } 
              />
              
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;