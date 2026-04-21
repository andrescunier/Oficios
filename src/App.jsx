import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { NotificationToast } from '@/components/ui/NotificationToast';
import { useStore } from '@/store/useStore';
import log from '@/lib/logger';
import { queryClient } from '@/lib/queryClient';
import { RouteLoader } from '@/components/ui/RouteLoader';
import { recordRouteChange } from '@/lib/observability';
import { consumePendingRedirect } from '@/features/auth/session';
import { PENDING_REDIRECT_EVENT } from '@/lib/session';
import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    log.router.debug('Navegación:', pathname);
    recordRouteChange(pathname);
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function PendingRedirectHandler() {
  const hasHydrated = useStore((state) => state.hasHydrated);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const processRedirect = () => {
      const redirect = consumePendingRedirect();
      if (!redirect) {
        return;
      }

      const currentLocation = `${location.pathname}${location.search}`;
      if (currentLocation !== redirect) {
        navigate(redirect, { replace: true });
      }
    };

    processRedirect();

    const handlePendingRedirect = () => {
      processRedirect();
    };

    window.addEventListener(PENDING_REDIRECT_EVENT, handlePendingRedirect);
    return () => window.removeEventListener(PENDING_REDIRECT_EVENT, handlePendingRedirect);
  }, [hasHydrated, location.pathname, location.search, navigate]);

  return null;
}

const Home = lazy(() => import('@/pages/Home').then((module) => ({ default: module.Home })));
const CategoryPage = lazy(() => import('@/pages/CategoryPage').then((module) => ({ default: module.CategoryPage })));
const ProductsPage = lazy(() => import('@/pages/ProductsPageApiReal').then((module) => ({ default: module.ProductsPageApiReal })));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage').then((module) => ({ default: module.ProductDetailPage })));
const ContactPage = lazy(() => import('@/pages/ContactPage').then((module) => ({ default: module.ContactPage })));
const AboutUs = lazy(() => import('@/pages/AboutUs').then((module) => ({ default: module.AboutUs })));
const Login = lazy(() => import('@/pages/Login').then((module) => ({ default: module.Login })));
const Register = lazy(() => import('@/pages/Register').then((module) => ({ default: module.Register })));
const CartPage = lazy(() => import('@/pages/CartPage').then((module) => ({ default: module.CartPage })));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage').then((module) => ({ default: module.CheckoutPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const OrdersPage = lazy(() => import('@/pages/OrdersPage').then((module) => ({ default: module.OrdersPage })));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage').then((module) => ({ default: module.FavoritesPage })));
const TermsAndConditions = lazy(() => import('@/pages/TermsAndConditions').then((module) => ({ default: module.TermsAndConditions })));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy').then((module) => ({ default: module.PrivacyPolicy })));
const LegalNotice = lazy(() => import('@/pages/LegalNotice').then((module) => ({ default: module.LegalNotice })));
const CookiesPolicy = lazy(() => import('@/pages/CookiesPolicy').then((module) => ({ default: module.CookiesPolicy })));
const OrderTracking = lazy(() => import('@/pages/OrderTracking').then((module) => ({ default: module.OrderTracking })));
const ReturnsPage = lazy(() => import('@/pages/ReturnsPage').then((module) => ({ default: module.ReturnsPage })));
const WarrantyPage = lazy(() => import('@/pages/WarrantyPage').then((module) => ({ default: module.WarrantyPage })));
const RegistrationSuccess = lazy(() => import('@/pages/RegistrationSuccess'));
const OrderSuccessPage = lazy(() => import('@/pages/OrderSuccessPage'));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <PendingRedirectHandler />
        <ScrollToTop />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/productos" element={<ProductsPage />} />
                <Route path="/productos/:id" element={<ProductDetailPage />} />
                <Route path="/contacto" element={<ContactPage />} />
                <Route path="/sobrenosotros" element={<AboutUs />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/registro-exitoso" element={<RegistrationSuccess />} />
                <Route path="/carrito" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/pedido-exitoso" element={<OrderSuccessPage />} />
                <Route path="/perfil" element={<ProfilePage />} />
                <Route path="/pedidos" element={<OrdersPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/favoritos" element={<FavoritesPage />} />
                <Route path="/terminos" element={<TermsAndConditions />} />
                <Route path="/privacidad" element={<PrivacyPolicy />} />
                <Route path="/aviso-legal" element={<LegalNotice />} />
                <Route path="/cookies" element={<CookiesPolicy />} />
                <Route path="/seguimiento" element={<OrderTracking />} />
                <Route path="/devoluciones" element={<ReturnsPage />} />
                <Route path="/garantias" element={<WarrantyPage />} />
                <Route path="/categoria/:category" element={<CategoryPage />} />
                <Route path="/categoria/:category/:subcategory" element={<CategoryPage />} />
                <Route path="/categoria/:category/:subcategory/:subsubcategory" element={<CategoryPage />} />
                <Route path="*" element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold mb-4">404</h1>
                      <p className="text-gray-600 mb-8">Página no encontrada</p>
                      <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        Volver al Inicio
                      </Link>
                    </div>
                  </div>
                } />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          
          {/* Botón flotante de WhatsApp */}
          <WhatsAppButton />
          
          {/* Notificaciones toast */}
          <NotificationToast />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
