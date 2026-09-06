import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminAMC from './pages/admin/AMC';
import AdminTechnicians from './pages/admin/Technicians';
import AdminComplaints from './pages/admin/Complaints';

import TechnicianShell from './components/TechnicianShell';
import TodayVisits from './pages/technician/TodayVisits';
import CompleteVisit from './pages/technician/CompleteVisit';
import TechnicianComplaints from './pages/technician/Complaints';
import TechnicianProfile from './pages/technician/Profile';

import CustomerLayout from './layouts/CustomerLayout';
import MyAMC from './pages/customer/MyAMC';
import CustomerComplaints from './pages/customer/Complaints';
import ServiceHistory from './pages/customer/ServiceHistory';

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'technician') return <Navigate to="/technician" replace />;
  return <Navigate to="/customer" replace />;
}

function TechnicianWrap({ title, children }) {
  return <TechnicianShell title={title}>{children}</TechnicianShell>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="amc" element={<AdminAMC />} />
            <Route path="technicians" element={<AdminTechnicians />} />
            <Route path="complaints" element={<AdminComplaints />} />
          </Route>

          <Route path="/technician" element={<ProtectedRoute roles={['technician']}><TechnicianWrap title="Today's Visits"><TodayVisits /></TechnicianWrap></ProtectedRoute>} />
          <Route path="/technician/visit/:id" element={<ProtectedRoute roles={['technician']}><TechnicianWrap title="Complete Visit"><CompleteVisit /></TechnicianWrap></ProtectedRoute>} />
          <Route path="/technician/complaints" element={<ProtectedRoute roles={['technician']}><TechnicianWrap title="My Complaints"><TechnicianComplaints /></TechnicianWrap></ProtectedRoute>} />
          <Route path="/technician/profile" element={<ProtectedRoute roles={['technician']}><TechnicianWrap title="Profile"><TechnicianProfile /></TechnicianWrap></ProtectedRoute>} />

          <Route path="/customer" element={<ProtectedRoute roles={['customer']}><CustomerLayout /></ProtectedRoute>}>
            <Route index element={<MyAMC />} />
            <Route path="history" element={<ServiceHistory />} />
            <Route path="complaints" element={<CustomerComplaints />} />
          </Route>

          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
