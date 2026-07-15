/**
 * Página de productos favoritos del usuario
 */

import React, { useState, useEffect } from 'react';
import { getUIConfig } from '@/config/runtime';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, ArrowLeft, Lock, Search } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';
import { productService } from '@/services/productService';
import type { Product } from '@/types/api';

export const FavoritesPage: React.FC = () => {
  const { auth, favorites, removeFromFavorites, addToCart, addNotification } = useStore();
  const uiCfg = getUIConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (auth.isAuthenticated) {
      loadFavoriteProducts();
    }
  }, [favorites, auth.isAuthenticated]);

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <Lock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-4">{uiCfg.authRequiredTitle}</h2>
          <p className="text-muted-foreground mb-6">{uiCfg.favoritesAuthMessage}</p>
          <Link
            to="/login"
            state={{ from: '/favoritos' }}
            className="inline-flex bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] hover:opacity-90 transition-opacity"
          >
            {uiCfg.authLoginButtonLabel}
          </Link>
        </div>
      </div>
    );
  }

  const loadFavoriteProducts = async () => {
    setIsLoading(true);
    try {
      const products: Product[] = [];
      for (const productId of favorites) {
        try {
          const product = await productService.getProduct(productId);
          products.push(product);
        } catch {
          removeFromFavorites(productId);
        }
      }
      setFavoriteProducts(products);
    } catch {
      addNotification({
        type: 'error',
        title: 'Error al cargar favoritos',
        message: 'No se pudieron cargar algunos de tus productos favoritos',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAllToCart = () => {
    let addedCount = 0;
    filteredFavorites.forEach((product) => {
      if (product.has_variants) return;
      if (product.stock_quantity && product.stock_quantity > 0) {
        addToCart(product, 1);
        addedCount++;
      }
    });

    addNotification({
      type: 'success',
      title: 'Productos agregados',
      message: `${addedCount} productos agregados al carrito`,
    });
  };

  const filteredFavorites = favoriteProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/perfil"
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {uiCfg.favoritesBackLabel}
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{uiCfg.favoritesPageTitle}</h1>
                <p className="text-muted-foreground text-sm">
                  {favoriteProducts.length}{' '}
                  {favoriteProducts.length !== 1
                    ? uiCfg.favoritesCountPlural
                    : uiCfg.favoritesCountSingular}
                </p>
              </div>
            </div>

            {favoriteProducts.length > 0 && (
              <button
                onClick={handleAddAllToCart}
                className="inline-flex items-center justify-center bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold uppercase tracking-[0.15em] hover:opacity-90 transition-opacity"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {uiCfg.favoritesAddAllLabel}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : favoriteProducts.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{uiCfg.favoritesEmptyTitle}</h3>
            <p className="text-muted-foreground mb-6">{uiCfg.favoritesEmptyBody}</p>
            <Link
              to="/productos"
              className="inline-flex bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] hover:opacity-90 transition-opacity"
            >
              {uiCfg.favoritesEmptyExploreLabel}
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={uiCfg.favoritesSearchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-input bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {filteredFavorites.length} de {favoriteProducts.length} productos
              </span>
            </div>

            {filteredFavorites.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{uiCfg.noProductsTitle}</h3>
                <p className="text-muted-foreground">{uiCfg.favoritesNoResultsBody}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredFavorites.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
