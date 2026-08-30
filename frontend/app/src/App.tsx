import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useProductStore } from '@/stores/productStore';
import { useOrderStore } from '@/stores/orderStore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import MobileNav from '@/components/layout/MobileNav';
import AuthModal from '@/components/ui/AuthModal';
import ToastNotification from '@/components/ui/ToastNotification';
import ScrollToTop from '@/components/ScrollToTop';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import About from '@/pages/About';
import FAQs from '@/pages/FAQs';
import Contact from '@/pages/Contact';
import Affiliate from '@/pages/Affiliate';
import Checkout from '@/pages/Checkout';
import UserDashboard from '@/pages/UserDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import Login from './pages/Login';

function App() {
  const location = useLocation();

  // 1. Existing Scroll to Top logic
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // ==========================================
  // ADDED: Realtime stores initialization & data fetching
  // ==========================================
  useEffect(() => {
    const cleanupProducts = useProductStore.getState().initRealtime();
    const cleanupOrders = useOrderStore.getState().initRealtime();
    useProductStore.getState().fetchProducts();
    
    return () => { 
      cleanupProducts(); 
      cleanupOrders(); 
    };
  }, []);

  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-white">
      <ScrollToTop />
      {!isDashboard && !isAdmin && <Navbar />}
      <CartDrawer />
      <MobileNav />
      <AuthModal />
      <ToastNotification />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/about" element={<About />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/affiliate" element={<Affiliate />} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/*" element={
          <UserDashboard />
        } />
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
      </Routes>

      {!isDashboard && !isAdmin && <Footer />}
    </div>
  );
}

export default App;