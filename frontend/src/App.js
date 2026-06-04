import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import HomePage from './pages/user/HomePage';
import ProductsPage from './pages/user/ProductsPage';
import ProductDetailPage from './pages/user/ProductDetailPage';
import CartPage from './pages/user/CartPage';
import CheckoutPage from './pages/user/CheckoutPage';
import OrdersPage from './pages/user/OrdersPage';
import OrderDetailPage from './pages/user/OrderDetailPage';
import OrderSuccessPage from './pages/user/OrderSuccessPage';
import ProfilePage from './pages/user/ProfilePage';
import LoginPage from './pages/user/LoginPage';
import RegisterPage from './pages/user/RegisterPage';
import ForgotPasswordPage from './pages/user/ForgotPasswordPage';
import ResetPasswordPage from './pages/user/ResetPasswordPage';
import WishlistPage from './pages/user/WishlistPage';
import StoryPage from './pages/user/StoryPage';
import SpecialsPage from './pages/user/SpecialsPage';
import OccasionsPage from './pages/user/OccasionsPage';
import AboutPage from './pages/user/AboutPage';
import PrivacyPolicyPage from './pages/user/PrivacyPolicyPage';
import TermsPage from './pages/user/TermsPage';
import CancellationPolicyPage from './pages/user/CancellationPolicyPage';
import ShippingPolicyPage from './pages/user/ShippingPolicyPage';
import HelpPage from './pages/user/HelpPage';
import FAQsPage from './pages/user/FAQsPage';
import FeedbackPage from './pages/user/FeedbackPage';
import NotFoundPage from './pages/user/NotFoundPage';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

import { useState, useEffect } from 'react';
import { contentAPI } from './services/api';

const PrivateRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <div className="text-center py-5"><div className="spinner-border" style={{ color:'#E8001D' }} /></div>;
  return isLoggedIn ? children : <Navigate to="/login" />;
};

const UserLayout = ({ children, logo, announcement }) => (
  <><Navbar logo={logo} announcement={announcement} /><main style={{ minHeight:'80vh' }}>{children}</main><Footer logo={logo} /></>
);

function AppRoutes() {
  const [logo, setLogo] = useState(() => {
    try {
      const cached = localStorage.getItem('pakka_logo');
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [announcement, setAnnouncement] = useState(() => {
    try { return localStorage.getItem('pakka_announcement'); } catch { return null; }
  });

  useEffect(() => {
    contentAPI.getHomepage()
      .then(r => {
        if (r.data.content?.logo?.url) {
          const logoData = r.data.content.logo;
          setLogo(logoData);
          try { localStorage.setItem('pakka_logo', JSON.stringify(logoData)); } catch {}
        }
        if (r.data.content && 'announcementText' in r.data.content) {
          const txt = r.data.content.announcementText;
          setAnnouncement(txt);
          try { localStorage.setItem('pakka_announcement', txt); } catch {}
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Routes>
      <Route path="/" element={<UserLayout logo={logo} announcement={announcement}><HomePage /></UserLayout>} />
      <Route path="/products" element={<UserLayout logo={logo} announcement={announcement}><ProductsPage /></UserLayout>} />
      <Route path="/products/:id" element={<UserLayout logo={logo} announcement={announcement}><ProductDetailPage /></UserLayout>} />
      <Route path="/occasions" element={<OccasionsPage logo={logo} announcement={announcement} />} />
      <Route path="/occasions/:occasionId" element={<OccasionsPage logo={logo} announcement={announcement} />} />
      <Route path="/story" element={<UserLayout logo={logo} announcement={announcement}><StoryPage /></UserLayout>} />
      <Route path="/specials" element={<UserLayout logo={logo} announcement={announcement}><SpecialsPage /></UserLayout>} />
      <Route path="/specials/:categorySlug" element={<UserLayout logo={logo} announcement={announcement}><SpecialsPage /></UserLayout>} />
      <Route path="/about" element={<UserLayout logo={logo} announcement={announcement}><AboutPage /></UserLayout>} />
      <Route path="/privacy-policy" element={<UserLayout logo={logo} announcement={announcement}><PrivacyPolicyPage /></UserLayout>} />
      <Route path="/terms" element={<UserLayout logo={logo} announcement={announcement}><TermsPage /></UserLayout>} />
      <Route path="/cancellation-policy" element={<UserLayout logo={logo} announcement={announcement}><CancellationPolicyPage /></UserLayout>} />
      <Route path="/shipping-policy" element={<UserLayout logo={logo} announcement={announcement}><ShippingPolicyPage /></UserLayout>} />
      <Route path="/help" element={<UserLayout logo={logo} announcement={announcement}><HelpPage /></UserLayout>} />
      <Route path="/faqs" element={<UserLayout logo={logo} announcement={announcement}><FAQsPage /></UserLayout>} />
      <Route path="/feedback" element={<UserLayout logo={logo} announcement={announcement}><FeedbackPage /></UserLayout>} />
      <Route path="/login" element={<LoginPage />} />
<Route path="/admin/login" element={<AdminLoginPage />} />

<Route
  path="/admin"
  element={
    <PrivateRoute>
      <AdminDashboard />
    </PrivateRoute>
  }
/>      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/cart" element={<PrivateRoute><UserLayout logo={logo} announcement={announcement}><CartPage /></UserLayout></PrivateRoute>} />
      <Route path="/checkout" element={<PrivateRoute><UserLayout logo={logo} announcement={announcement}><CheckoutPage /></UserLayout></PrivateRoute>} />
      <Route path="/orders" element={<PrivateRoute><UserLayout logo={logo} announcement={announcement}><OrdersPage /></UserLayout></PrivateRoute>} />
      <Route path="/orders/success/:orderId" element={<PrivateRoute><UserLayout logo={logo} announcement={announcement}><OrderSuccessPage /></UserLayout></PrivateRoute>} />
      <Route path="/orders/:id" element={<PrivateRoute><UserLayout logo={logo} announcement={announcement}><OrderDetailPage /></UserLayout></PrivateRoute>} />
      <Route path="/wishlist" element={<PrivateRoute><UserLayout logo={logo} announcement={announcement}><WishlistPage /></UserLayout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><UserLayout logo={logo} announcement={announcement}><ProfilePage /></UserLayout></PrivateRoute>} />

      {/* Admin routes are no longer served from the user app.
          Access the admin panel at http://localhost:3001 (dev) or https://admin.yourdomain.com (prod) */}

      <Route path="*" element={<UserLayout logo={logo} announcement={announcement}><NotFoundPage /></UserLayout>} />
    </Routes>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <AppRoutes />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
