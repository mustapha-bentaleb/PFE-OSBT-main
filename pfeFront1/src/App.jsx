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
        <Toaster position="top-right" />
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;