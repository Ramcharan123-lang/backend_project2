import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentManagement from './pages/StudentManagement';
import GroupManagement from './pages/GroupManagement';
import ProjectManagement from './pages/ProjectManagement';
import TaskManagement from './pages/TaskManagement';
import SubmissionPage from './pages/SubmissionPage';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';

const AppLayout = ({ role }) => {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;
  
  return <AppLayout role={role} />;
};

function App() {
  const role = localStorage.getItem('role');
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Auth />} />
        
        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<StudentManagement />} />
          <Route path="/admin/groups" element={<GroupManagement />} />
          <Route path="/admin/projects" element={<ProjectManagement />} />
          <Route path="/admin/tasks" element={<TaskManagement />} />
          <Route path="/admin/submissions" element={<SubmissionPage />} />
        </Route>

        {/* Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student" element={<StudentDashboard />} />
        </Route>

        {/* Shared Routes */}
        <Route element={<ProtectedRoute allowedRoles={['student', 'admin']} />}>
          <Route path="/student/tasks" element={<TaskManagement />} />
          <Route path="/student/submissions" element={<SubmissionPage />} />
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to={role === 'admin' ? '/admin' : '/student'} />} />
      </Routes>
    </Router>
  );
}

export default App;
