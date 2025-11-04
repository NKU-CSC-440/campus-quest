import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QuestList from './components/QuestList';
import ProfilePage from './components/ProfilePage';
import LoginPage from './components/LoginPage';
import SignUp from './components/SignUp';
import MenuAppBar from './components/AppBar';
import QuestDashboard from './components/QuestDashboard';
import { OrganizationList } from './components/OrganizationList';
import { ApprovalsList } from './components/ApprovalsList';
import { LeaderboardPage } from './components/LeaderboardPage';
import Layout from './components/Layout';

function App() {
  // For now, use a hardcoded user ID for QuestList
  return (
    <Router>
      {/* Layout wrapper to keep AppBar outside of Routes */}
      <Layout>
        <Routes>
          <Route path="/" element={<QuestDashboard />} />
          <Route path="/organizations" element={<OrganizationList />} />
          <Route path="/approvals" element={<ApprovalsList />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign_up" element={<SignUp />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
