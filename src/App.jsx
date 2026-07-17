import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { NotificationToast } from '@/components/ui/NotificationToast';
import { ConsentBanner } from '@/components/ui/ConsentBanner';
import { useStore } from '@/store/useStore';
import log from '@/lib/logger';
import { queryClient } from '@/lib/queryClient';
import { RouteLoader } from '@/components/ui/RouteLoader';
import { recordRouteChange } from '@/lib/observability';
import { consumePendingRedirect } from '@/features/auth/session';
import { PENDING_REDIRECT_EVENT } from '@/lib/session';
import { applySeo } from '@/lib/seo';
import { bootstrapAnalytics, trackPageView } from '@/lib/analytics';
import { useTokenExpiry } from '@/hooks/useTokenExpiry';
import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    log.router.debug('Navegación:', pathname);
    recordRouteChange(pathname);
    applySeo({ pathname });
    trackPageView(pathname, document.title);
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
const RegisterSupplier = lazy(() => import('@/pages/RegisterSupplier').then((module) => ({ default: module.RegisterSupplier })));
const ProviderDashboard = lazy(() => import('@/pages/ProviderDashboard').then((module) => ({ default: module.ProviderDashboard })));
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
const ShippingPage = lazy(() => import('@/pages/ShippingPage').then((module) => ({ default: module.ShippingPage })));
const WarrantyPage = lazy(() => import('@/pages/WarrantyPage').then((module) => ({ default: module.WarrantyPage })));
const NotFound = lazy(() => import('@/pages/NotFound').then((module) => ({ default: module.NotFound })));
const RegistrationSuccess = lazy(() => import('@/pages/RegistrationSuccess'));
const OrderSuccessPage = lazy(() => import('@/pages/OrderSuccessPage'));

function TokenExpiryMonitor() {
  useTokenExpiry();
  return null;
}

function App() {
  useEffect(() => {
    applySeo({ pathname: typeof window !== 'undefined' ? window.location.pathname : '/' });
    bootstrapAnalytics();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <PendingRedirectHandler />
        <ScrollToTop />
        <TokenExpiryMonitor />
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
                <Route path="/como-funciona" element={<AboutUs />} />
                <Route path="/visitas" element={<ShippingPage />} />
                <Route path="/envios" element={<ShippingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/registro-proveedor" element={<RegisterSupplier />} />
                <Route path="/proveedor" element={<ProviderDashboard />} />
                <Route path="/proveedor/servicios/nuevo" element={<ProviderDashboard />} />
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
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          
          {/* Botón flotante de WhatsApp */}
          <WhatsAppButton />
          
          {/* Notificaciones toast */}
          <NotificationToast />

          {/* GDPR / cookie consent banner */}
          <ConsentBanner />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
