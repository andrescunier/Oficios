/**
 * Header profesional para DIAP Store Ecommerce
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu,
  LogIn,
  UserPlus,
  X,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStore } from '@/store/useStore';
import { BRANDING, ASSETS } from '@/config/branding';
import { getCategoriesConfig } from '@/config/runtime';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  // Usar el store real para autenticación y carrito
  const { auth, cart, favorites, logout } = useStore();
  const isAuthenticated = auth.isAuthenticated;
  const user = auth.user;
  const cartItemCount = cart.items.length;

  // Detectar estado inconsistente
  const hasInconsistentState = React.useMemo(() => {
    return (
      (isAuthenticated && !auth.token) ||
      (isAuthenticated && !user) ||
      (!isAuthenticated && auth.token) ||
      (auth.token && auth.token.length < 10)
    );
  }, [isAuthenticated, auth.token, user]);

  // Limpiar automáticamente si hay inconsistencia
  React.useEffect(() => {
    if (hasInconsistentState) {
      console.error('🔴 Estado inconsistente detectado en Header!');
      console.log({
        isAuthenticated,
        hasToken: !!auth.token,
        tokenLength: auth.token?.length,
        hasUser: !!user,
      });
      
      // Forzar limpieza
      logout();
      localStorage.clear();
      sessionStorage.clear();

      // Marcar redirección para que la app procese la navegación
      try {
        localStorage.setItem('diap-redirect', '/login?session=invalid');
      } catch (e) {
        console.error('Error setting diap-redirect flag:', e);
      }

      // Recargar para asegurar que todos los módulos se reinician y la app procese la flag
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }, [hasInconsistentState, isAuthenticated, auth.token, user, logout]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/productos?buscar=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.clear();
    sessionStorage.clear();
    setIsMenuOpen(false);
    // Redirigir a home después del logout
    window.location.href = '/';
  };

  const categories = getCategoriesConfig().map(c => ({
    name: c.name,
    href: c.link,
  }));

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-2">
          <p className="text-center text-sm font-medium">
            🎉 {BRANDING.APP_SLOGAN} - Envío gratis en todas tus compras
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center">
              {ASSETS.HEADER_LOGO_PATH ? (
                <img
                  src={ASSETS.HEADER_LOGO_PATH}
                  alt={`${BRANDING.APP_NAME} Logo`}
                  className="h-10 w-auto"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {BRANDING.APP_NAME.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </Link>

            <nav className="hidden lg:flex space-x-8">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={category.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden md:block flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Buscar productos..."
                className="pl-10 pr-4"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </form>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/favoritos" className="relative">
                <Heart className={`h-5 w-5 ${favorites.length > 0 ? 'text-red-500' : ''}`} />
                {favorites.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs bg-red-500 hover:bg-red-600">
                    {favorites.length}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild>
              <Link to="/carrito" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="h-5 w-5" />
                    {/* Indicador de usuario logueado */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.username || 'Usuario'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || 'Sin email'}
                      </p>
                      <div className="flex items-center mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-xs text-green-600">Conectado</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/perfil">Mi Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/pedidos">Mis Pedidos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/favoritos">Favoritos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Ingresar
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/registro">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Registrarse
                  </Link>
                </Button>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <form onSubmit={handleSearch} className="relative mb-4">
              <Input
                type="search"
                placeholder="Buscar productos..."
                className="pl-10 pr-4"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </form>

            <nav className="space-y-2 mb-4">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={category.href}
                  className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </nav>

            <div className="space-y-2 border-t pt-4">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg mb-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-green-800">Conectado como:</span>
                    </div>
                    <p className="text-sm text-green-700 font-medium">{user?.username || 'Usuario'}</p>
                    <p className="text-xs text-green-600">{user?.email || 'Sin email'}</p>
                  </div>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to="/perfil" onClick={() => setIsMenuOpen(false)}>
                      <User className="h-4 w-4 mr-2" />
                      Mi Perfil
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to="/pedidos" onClick={() => setIsMenuOpen(false)}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Mis Pedidos
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to="/favoritos" onClick={() => setIsMenuOpen(false)}>
                      <Heart className="h-4 w-4 mr-2" />
                      Favoritos
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50" 
                    onClick={handleLogout}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <LogIn className="h-4 w-4 mr-2" />
                      Ingresar
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" asChild>
                    <Link to="/registro" onClick={() => setIsMenuOpen(false)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Registrarse
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
