import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QuestList from './components/QuestList';
import ProfilePage from './components/ProfilePage';
import LoginPage from './components/LoginPage';
import MenuAppBar from './components/AppBar';
import QuestDashboard from './components/QuestDashboard';
import Layout from './components/Layout';

function App() {
  // For now, use a hardcoded user ID for QuestList
  return (
    <Router>
      {/* Layout wrapper to keep AppBar outside of Routes */}
      <Layout>
        <Routes>
          <Route path="/" element={<QuestDashboard currentUserId={1} />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
