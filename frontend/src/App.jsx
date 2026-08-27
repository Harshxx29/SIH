import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import WorkerLayout from './layouts/WorkerLayout';
import AdminLayout from './layouts/AdminLayout';

// Public & Auth
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Info Pages
import About from './pages/public/About';
import Services from './pages/public/Services';
import Cooperatives from './pages/public/Cooperatives';

// Customer Pages
import CustomerHome from './pages/customer/CustomerHome';
import EmergencyBooking from './pages/customer/EmergencyBooking';
import LiveNearby from './pages/customer/LiveNearby';

// Worker Pages
import WorkerDashboard from './pages/worker/WorkerDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Shared Pages
import Profile from './pages/shared/Profile';
import ComingSoon from './pages/shared/ComingSoon';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Layout Wrapper
const PublicLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
    <Navbar />
    {children}
    <Footer />
  </div>
);

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<><Navbar /><Landing /><Footer /></>} />
          <Route path="/login" element={<><Navbar /><Login /><Footer /></>} />
          <Route path="/register" element={<><Navbar /><Register /><Footer /></>} />

          {/* Informational Pages */}
          <Route path="/about" element={<><Navbar /><About /><Footer /></>} />
          <Route path="/services" element={<><Navbar /><Services /><Footer /></>} />
          <Route path="/cooperatives" element={<><Navbar /><Cooperatives /><Footer /></>} />
          
          <Route path="/pricing" element={<><Navbar /><ComingSoon /><Footer /></>} />
          <Route path="/worker" element={<><Navbar /><ComingSoon /><Footer /></>} />
          <Route path="/welfare" element={<><Navbar /><ComingSoon /><Footer /></>} />
          <Route path="/privacy" element={<><Navbar /><ComingSoon /><Footer /></>} />
          <Route path="/terms" element={<><Navbar /><ComingSoon /><Footer /></>} />
          <Route path="/contact" element={<><Navbar /><ComingSoon /><Footer /></>} />

          {/* Customer Routes */}
          <Route path="/customer" element={<ProtectedRoute allowedRoles={['Customer']}><CustomerLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CustomerHome />} />
            <Route path="live-nearby" element={<LiveNearby />} />
            <Route path="bookings" element={<CustomerHome />} /> {/* Reusing for demo */}
            <Route path="emergency" element={<EmergencyBooking />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Worker Routes */}
          <Route path="/worker" element={<ProtectedRoute allowedRoles={['Worker']}><WorkerLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<WorkerDashboard />} />
            <Route path="jobs" element={<WorkerDashboard />} />
            <Route path="earnings" element={<WorkerDashboard />} />
            <Route path="welfare" element={<WorkerDashboard />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['SuperAdmin']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="verification" element={<AdminDashboard />} />
            <Route path="services" element={<AdminDashboard />} />
            <Route path="financials" element={<AdminDashboard />} />
            <Route path="forecasting" element={<AdminDashboard />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
