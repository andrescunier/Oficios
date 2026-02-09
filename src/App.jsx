import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Componente para scroll al top en cada navegación
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    log.router.debug('Navegación:', pathname);
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { NotificationToast } from '@/components/ui/NotificationToast';
import { Home } from '@/pages/Home';
import { CategoryPage } from '@/pages/CategoryPage';
import { ProductsPageApiReal as ProductsPage } from '@/pages/ProductsPageApiReal';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { ContactPage } from '@/pages/ContactPage';
import { AboutUs } from '@/pages/AboutUs';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { OrdersPage } from '@/pages/OrdersPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { TermsAndConditions } from '@/pages/TermsAndConditions';
import { PrivacyPolicy } from '@/pages/PrivacyPolicy';
import { LegalNotice } from '@/pages/LegalNotice';
import { CookiesPolicy } from '@/pages/CookiesPolicy';
import { OrderTracking } from '@/pages/OrderTracking';
import { ReturnsPage } from '@/pages/ReturnsPage';
import { WarrantyPage } from '@/pages/WarrantyPage';
import RegistrationSuccess from '@/pages/RegistrationSuccess';
import OrderSuccessPage from '@/pages/OrderSuccessPage';
import { QUERY_CONFIG } from '@/config/api';
import { useStore } from '@/store/useStore';
import log from '@/lib/logger';
import './App.css';

// Crear cliente de React Query
const queryClient = new QueryClient(QUERY_CONFIG);

function App() {
  const { auth, logout } = useStore();

  // Validar sesión al cargar la aplicación
  useEffect(() => {
    // Si dice que está autenticado pero no hay user o token válido, limpiar
    if (auth.isAuthenticated && (!auth.user || !auth.token || auth.token.length < 10)) {
      log.store.warn('Sesión corrupta detectada, limpiando...');
      logout();
      localStorage.removeItem('diapstore-store');
      sessionStorage.clear();
    }
  }, [auth.isAuthenticated, auth.user, auth.token, logout]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
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
              {/* Catch all route para rutas no encontradas */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-gray-600 mb-8">Página no encontrada</p>
                    <a href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                      Volver al Inicio
                    </a>
                  </div>
                </div>
              } />
            </Routes>
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
