// src/App.js
import React, { useContext } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Explorer from './pages/Explorer';
import NotFound from './pages/NotFound';

const App = () => {
  const { user, logout } = useContext(AuthContext);

  const layoutStyle = {
    maxWidth: 960,
    margin: '0 auto',
    padding: '16px',
  };

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottom: '1px solid #ddd',
    paddingBottom: 8,
  };

  const navLinksStyle = {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  };

  return (
    <div style={layoutStyle}>
      <header style={navStyle}>
        <div>
          <Link to="/" style={{ textDecoration: 'none', fontWeight: 'bold' }}>
            Expense Tracker
          </Link>
        </div>

        <div style={navLinksStyle}>
          {user && (
            <>
              <Link to="/">Dashboard</Link>
              <Link to="/explorer">Explorer</Link>
              <button onClick={logout}>Logout</button>
            </>
          )}
          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </header>

      <main>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explorer"
            element={
              <ProtectedRoute>
                <Explorer />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
