import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';

import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Landing from './components/Landing';
import HomePage from './components/HomePage';
import AddRecipe from './components/AddRecipe';
import Recipe from './components/Recipe';
import ProfilePage from './components/ProfilePage';
import SavedRecipes from './components/SavedRecipes';
import Footer from './components/Footer';

import 'react-toastify/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { useState } from 'react';
import RefreshHandler from './components/RefreshHandler';

// === ADMIN PAGES ===
import AdminDashboard from "./components/AdminDashboard";
import UserManagement from "./components/UserManagement";
import RecipeManagement from "./components/RecipeManagement";
import CommentManagement from "./components/CommentManagement";

const HIDE_FOOTER_ON = [
  '/landing', 
  '/login', 
  '/signup', 
  '/'
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const PrivateRoute = ({ children }) => {
    if (authLoading) {
      return <div style={{ textAlign: 'center', padding: '80px' }}>Loading...</div>;
    }
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  const AdminRoute = ({ children }) => {
    if (authLoading) {
      return <div style={{ textAlign: 'center', padding: '80px' }}>Loading...</div>;
    }
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (userRole !== 'admin') return <Navigate to="/home" replace />;
    return children;
  };

  const AppContent = () => {
    const location = useLocation();
    const isAdminPage = location.pathname.startsWith('/admin');
    const showFooter = !HIDE_FOOTER_ON.includes(location.pathname) && !isAdminPage;

    return (
      <>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/landing" replace />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected user routes */}
          <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/recipes" element={<PrivateRoute><Recipe /></PrivateRoute>} />
          <Route path="/add-recipe" element={<PrivateRoute><AddRecipe /></PrivateRoute>} />
          <Route path="/saved" element={<PrivateRoute><SavedRecipes /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          {/* ADMIN ROUTES */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/recipes" element={<AdminRoute><RecipeManagement /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
          <Route path="/admin/comments" element={<AdminRoute><CommentManagement /></AdminRoute>} />

          {/* 404 */}
          <Route path="*" element={<h2 style={{ textAlign: 'center', padding: '100px' }}>404 - Page Not Found</h2>} />
        </Routes>

        {showFooter && <Footer />}
      </>
    );
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
      <RefreshHandler
        setIsAuthenticated={setIsAuthenticated}
        setUserRole={setUserRole}
        setAuthLoading={setAuthLoading}
      />
      <AppContent />
    </>
  );
}

export default App;