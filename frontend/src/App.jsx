import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Landing from './components/Landing';
import HomePage from './components/HomePage';
import AddRecipe from './components/AddRecipe';
import Recipe from './components/Recipe';
import ProfilePage from './components/ProfilePage';
import SavedRecipes from './components/SavedRecipes';   // ← Add this import
import Footer from './components/Footer';
import 'react-toastify/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { useState } from 'react';
import RefreshHandler from './components/RefreshHandler';

// Pages where the Footer should NOT appear
const HIDE_FOOTER_ON = ['/landing', '/login', '/signup', '/'];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const PrivateRoutes = ({ element }) => {
    if (authLoading) return null; // Wait for auth check
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  const AppContent = () => {
    const location = useLocation();
    const showFooter = !HIDE_FOOTER_ON.includes(location.pathname);

    return (
      <>
        <Routes>
          <Route path="/" element={<Navigate to="/landing" />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route path="/home" element={<PrivateRoutes element={<HomePage />} />} />
          <Route path="/recipes" element={<PrivateRoutes element={<Recipe />} />} />
          <Route path="/add-recipe" element={<PrivateRoutes element={<AddRecipe />} />} />
          
          {/* ✅ ADD THIS LINE */}
          <Route path="/saved" element={<PrivateRoutes element={<SavedRecipes />} />} />

          <Route path="/profile" element={<PrivateRoutes element={<ProfilePage />} />} />

          {/* Optional: 404 Page */}
          <Route path="*" element={<h2 style={{ textAlign: 'center', padding: '50px' }}>404 - Page Not Found</h2>} />
        </Routes>

        {/* Footer only on authenticated pages */}
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
        newestOnTop={false}
        closeOnClick
        pauseOnHover
      />

      <RefreshHandler
        setIsAuthenticated={setIsAuthenticated}
        setAuthLoading={setAuthLoading}
      />

      <AppContent />
    </>
  );
}

export default App;