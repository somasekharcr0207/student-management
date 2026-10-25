
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Courses from './pages/Courses';
import Profile from './pages/Profile';

import './App.css';

function App() {
  const isAuthenticated = Boolean(
    localStorage.getItem('access_token')
  );

  return (
    <BrowserRouter>
      <Routes>
        {/* Login page */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Dashboard page */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Student management page */}
        <Route
          path="/students"
          element={
            isAuthenticated ? (
              <Students />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Course management page */}
        <Route
          path="/courses"
          element={
            isAuthenticated ? (
              <Courses />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* Profile page */}
        <Route
          path="/profile"
          element={
           isAuthenticated ? (
             <Profile />
           ) : (
             <Navigate to="/login" replace />
           )
         }
/>
        {/* Default route */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* Handle unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

