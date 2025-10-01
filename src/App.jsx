import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Home } from '@/pages/Home-simplified';
import { CategoryPage } from '@/pages/CategoryPage';
import { ProductsPageApiReal as ProductsPage } from '@/pages/ProductsPageApiReal';
import { ContactPage } from '@/pages/ContactPage';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { QUERY_CONFIG } from '@/config/api';
import './App.css';

// Crear cliente de React Query
const queryClient = new QueryClient(QUERY_CONFIG);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/productos" element={<ProductsPage />} />
              <Route path="/contacto" element={<ContactPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route path="/carrito" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
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
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
