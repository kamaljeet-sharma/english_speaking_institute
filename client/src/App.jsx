import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Courses from './pages/Courses';
import About from './pages/About';
import Reviews from './pages/Reviews';
import CourseDetail from './pages/CourseDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';

import StudentLayout from './pages/student/StudentLayout';
import Dashboard from './pages/student/Dashboard';
import Learn from './pages/student/Learn';
import StudentPayments from './pages/student/Payments';
import Profile from './pages/student/Profile';

import AdminLayout from './pages/admin/AdminLayout';
import Overview from './pages/admin/Overview';
import * as M from './pages/admin/Manage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:id" element={<CourseDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="contact" element={<Contact />} />
        <Route path="about" element={<About />} />
        <Route path="reviews" element={<Reviews />} />

        <Route element={<ProtectedRoute role="student" />}>
          <Route path="student" element={<StudentLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="learn/:courseId" element={<Learn />} />
            <Route path="payments" element={<StudentPayments />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Overview />} />
            <Route path="courses" element={<M.Courses />} />
            <Route path="batches" element={<M.Batches />} />
            <Route path="live-classes" element={<M.LiveClasses />} />
            <Route path="lectures" element={<M.Lectures />} />
            <Route path="students" element={<M.Students />} />
            <Route path="payments" element={<M.Payments />} />
            <Route path="announcements" element={<M.Announcements />} />
            <Route path="demo-requests" element={<M.DemoRequests />} />
            <Route path="reviews" element={<M.Reviews />} />
            <Route path="teachers" element={<M.Teachers />} />
          </Route>
        </Route>

        <Route path="*" element={<p className="px-4 py-20 text-center text-ink-soft">This page does not exist.</p>} />
      </Route>
    </Routes>
  );
}
