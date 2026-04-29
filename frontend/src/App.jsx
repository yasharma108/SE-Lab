import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Technicians from './pages/Technicians';
import Employees from './pages/Employees';
import Live from './pages/Live';
import TechHistory from './pages/TechHistory';
import TechNotes from './pages/TechNotes';
import AssignTech from './pages/AssignTech';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Loading application...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="app-container">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/assets" element={<ProtectedRoute><Assets /></ProtectedRoute>} />
          <Route path="/live" element={<ProtectedRoute><Live /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><TechHistory /></ProtectedRoute>} />
          <Route path="/tech-notes" element={<ProtectedRoute><TechNotes /></ProtectedRoute>} />
          <Route path="/assign-tech" element={<ProtectedRoute><AssignTech /></ProtectedRoute>} />
          <Route path="/technicians" element={<ProtectedRoute><Technicians /></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
