import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Toast from './components/Common/Toast';
import Login from './pages/Login';
import AppShell from './components/Layout/AppShell';
import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';        // ✅ New
import Sections from './pages/Sections';      // ✅ New
import Students from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import FeeManagement from './pages/FeeManagement';
import Expenses from './pages/Expenses';
import ClassManagement from './pages/ClassManagement';
import Settings from './pages/Settings';
import StudentPortal from './pages/StudentPortal';
import LoadingSpinner from './components/Common/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role === 'admin' ? '/dashboard' : '/portal'} replace />;
  }
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<AppShell />}>
        {/* Admin Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* ✅ New Routes for Campus -> Classes -> Sections flow */}
        <Route path="/classes/:campusId" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Classes />
          </ProtectedRoute>
        } />

        <Route path="/sections/:campusId/:classId" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Sections />
          </ProtectedRoute>
        } />

        <Route path="/students" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Students />
          </ProtectedRoute>
        } />

        <Route path="/students/:id" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <StudentProfile />
          </ProtectedRoute>
        } />

        <Route path="/fees" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <FeeManagement />
          </ProtectedRoute>
        } />

        <Route path="/expenses" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Expenses />
          </ProtectedRoute>
        } />

        <Route path="/classes" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ClassManagement />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Settings />
          </ProtectedRoute>
        } />

        {/* Student Routes */}
        <Route path="/portal" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentPortal />
          </ProtectedRoute>
        } />

        <Route path="/" element={
          <Navigate to={user?.role === 'admin' ? '/dashboard' : '/portal'} replace />
        } />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toast />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;