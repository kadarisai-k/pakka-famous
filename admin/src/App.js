import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import AdminLoginPage      from './pages/AdminLoginPage';
import AdminDashboard      from './pages/AdminDashboard';
import AdminAnalytics      from './pages/AdminAnalytics';
import AdminProducts       from './pages/AdminProducts';
import AdminFeaturedPicks  from './pages/AdminFeaturedPicks';
import AdminTopSellers     from './pages/AdminTopSellers';
import AdminOrders         from './pages/AdminOrders';
import AdminUsers          from './pages/AdminUsers';
import AdminOrderDetail    from './pages/AdminOrderDetail';
import AdminSettings       from './pages/AdminSettings';
import AdminCoupons        from './pages/AdminCoupons';
import AdminContent        from './pages/AdminContent';
import AdminCitySweets     from './pages/AdminCitySweets';
import AdminStories        from './pages/AdminStories';
import AdminSeasonalSpecials from './pages/AdminSeasonalSpecials';
import AdminSpecialOffers  from './pages/AdminSpecialOffers';
import AdminTodaySpecial   from './pages/AdminTodaySpecial';
import AdminTestimonials   from './pages/AdminTestimonials';
import AdminOccasions      from './pages/AdminOccasions';
import AdminPackings       from './pages/AdminPackings';
import AdminOccasionOrders from './pages/AdminOccasionOrders';
import AdminSpecials       from './pages/AdminSpecials';

const AdminRoute = ({ children }) => {
  const { isAdmin, isLoggedIn, loading } = useAuth();
  if (loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;
  if (!isLoggedIn) return <Navigate to="/login" />;
  return isAdmin ? children : <Navigate to="/login" />;
};

function AdminAppRoutes() {
  return (
    <Routes>
      <Route path="/"        element={<Navigate to="/login" />} />
      <Route path="/login"   element={<AdminLoginPage />} />
      <Route path="/dashboard"       element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/analytics"       element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
      <Route path="/products"        element={<AdminRoute><AdminProducts /></AdminRoute>} />
      <Route path="/featured-picks"  element={<AdminRoute><AdminFeaturedPicks /></AdminRoute>} />
      <Route path="/top-sellers"     element={<AdminRoute><AdminTopSellers /></AdminRoute>} />
      <Route path="/orders"          element={<AdminRoute><AdminOrders /></AdminRoute>} />
      <Route path="/orders/:id"      element={<AdminRoute><AdminOrderDetail /></AdminRoute>} />
      <Route path="/users"           element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/coupons"         element={<AdminRoute><AdminCoupons /></AdminRoute>} />
      <Route path="/content"         element={<AdminRoute><AdminContent /></AdminRoute>} />
      <Route path="/city-sweets"     element={<AdminRoute><AdminCitySweets /></AdminRoute>} />
      <Route path="/stories"         element={<AdminRoute><AdminStories /></AdminRoute>} />
      <Route path="/seasonal"        element={<AdminRoute><AdminSeasonalSpecials /></AdminRoute>} />
      <Route path="/settings"        element={<AdminRoute><AdminSettings /></AdminRoute>} />
      <Route path="/today-special"   element={<AdminRoute><AdminTodaySpecial /></AdminRoute>} />
      <Route path="/special-offers"  element={<AdminRoute><AdminSpecialOffers /></AdminRoute>} />
      <Route path="/testimonials"    element={<AdminRoute><AdminTestimonials /></AdminRoute>} />
      <Route path="/occasions"        element={<AdminRoute><AdminOccasions /></AdminRoute>} />
      <Route path="/packings"        element={<AdminRoute><AdminPackings /></AdminRoute>} />
      <Route path="/occasion-orders" element={<AdminRoute><AdminOccasionOrders /></AdminRoute>} />
      <Route path="/specials"         element={<AdminRoute><AdminSpecials /></AdminRoute>} />
      <Route path="*"                element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <AdminAppRoutes />
      </AuthProvider>
    </Router>
  );
}
export default App;
