import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import TshirtG from './pages/TshirtG';
import Messages from './pages/Messages';
import Offers from './pages/Offers';
import PrintOnDemand from './pages/PrintOnDemand';


// 🔐 Private Route (user connecté فقط)
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};


// 👮 Admin Route
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.isAdmin ? children : <Navigate to="/dashboard" />;
};


// 🔓 Public Route (login/register فقط)
const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  if (user?.isAdmin) return <Navigate to="/admin" />;
  if (user) return <Navigate to="/dashboard" />;

  return children;
};


function AppContent() {
  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Routes>

          {/* 🏠 HOME (default page) */}
          <Route path="/" element={<Home />} />

          {/* 🔓 AUTH */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* 🔐 USER */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <Messages />
              </PrivateRoute>
            }
          />

          <Route
            path="/offers"
            element={
              <PrivateRoute>
                <Offers />
              </PrivateRoute>
            }
          />

          <Route
            path="/print-on-demand"
            element={
              <PrivateRoute>
                <PrintOnDemand />
              </PrivateRoute>
            }
          />

          <Route
            path="/generate"
            element={
              <PrivateRoute>
                <TshirtG />
              </PrivateRoute>
            }
          />

          {/* 👮 ADMIN */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />

          {/* 🔁 fallback */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </div>
    </div>
  );
}


function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-center"
          gutter={12}
          containerStyle={{ direction: 'rtl' }}
          toastOptions={{
            duration: 3800,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              padding: '14px 18px',
              fontSize: '0.925rem',
              maxWidth: 'min(420px, 92vw)',
            },
            success: {
              duration: 3500,
              iconTheme: { primary: '#22c55e', secondary: '#fff' },
            },
            error: {
              duration: 5000,
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;