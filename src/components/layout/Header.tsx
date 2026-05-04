/**
 * Header profesional para Ecommerce
 */

import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu,
  LogIn,
  UserPlus,
  X,
  Heart,
  ChevronDown,
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
import { getCategoriesConfig, getUIConfig } from '@/config/runtime';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  // Usar el store real para autenticación y carrito
  const auth = useStore((state) => state.auth);
  const cart = useStore((state) => state.cart);
  const favorites = useStore((state) => state.favorites);
  const logout = useStore((state) => state.logout);
  const isAuthenticated = auth.isAuthenticated;
  const user = auth.user;
  const cartItemCount = cart.items.length;

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
    setIsMenuOpen(false);
    navigate('/', { replace: true });
  };

  const categories = getCategoriesConfig();
  const categoryGroups = useMemo(() => {
    const grouped = categories.reduce<Record<string, typeof categories>>((acc, category) => {
      const groupName = category.group?.trim() || 'Categorias';
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(category);
      return acc;
    }, {});

    return Object.entries(grouped);
  }, [categories]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Marquee promo bar (Ganga style) */}
      <div className="promo-bar overflow-hidden">
        <div className="relative flex w-full overflow-hidden py-2">
          <div className="flex shrink-0 animate-marquee gap-12 whitespace-nowrap px-6">
            {Array.from({ length: 2 }).flatMap((_, blockIdx) =>
              getUIConfig().headerPromoMessages.map((msg, idx) => (
                <span key={`promo-${blockIdx}-${idx}`}>{msg}</span>
              ))
            )}
          </div>
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

            <nav className="hidden lg:flex items-center space-x-6">
              {categoryGroups.length > 0 ? (
                <div className="relative group">
                  <button className="flex items-center gap-1 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                    {getUIConfig().headerCategoriesLabel}
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="absolute left-0 top-full z-50 invisible pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    <div
                      className="grid w-[min(960px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] gap-x-8 gap-y-4 rounded-lg border bg-background p-5 shadow-lg"
                      style={{
                        gridTemplateColumns: `repeat(${Math.min(Math.max(categoryGroups.length, 1), 4)}, minmax(180px, 1fr))`,
                      }}
                    >
                      {categoryGroups.map(([groupName, groupCategories]) => (
                        <div key={groupName}>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {groupName}
                          </p>
                          <div className="space-y-1">
                            {groupCategories.map((category) => (
                              <div key={category.link || category.slug || category.name}>
                                <Link
                                  to={category.link}
                                  className="block py-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
                                >
                                  {category.name}
                                </Link>
                                {category.subcategories && category.subcategories.length > 0 && (
                                  <div className="ml-3 space-y-0.5">
                                    {category.subcategories.map((sub) => (
                                      <div key={sub.link || sub.slug || sub.name}>
                                        <Link
                                          to={sub.link}
                                          className="block py-0.5 text-xs text-muted-foreground transition-colors hover:text-primary"
                                        >
                                          {sub.name}
                                        </Link>
                                        {sub.subcategories && sub.subcategories.length > 0 && (
                                          <div className="ml-3 space-y-0.5">
                                            {sub.subcategories.map((subsub) => (
                                              <Link
                                                key={subsub.link || subsub.slug || subsub.name}
                                                to={subsub.link}
                                                className="block py-0.5 text-xs text-muted-foreground/70 transition-colors hover:text-primary"
                                              >
                                                {subsub.name}
                                              </Link>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
              <Link
                to="/productos"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {getUIConfig().headerAllProductsLabel}
              </Link>
            </nav>
          </div>

          <div className="hidden md:block flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="search"
                    placeholder={getUIConfig().searchPlaceholder}
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
                    <Link to="/perfil">{getUIConfig().headerMyProfileLabel}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/pedidos">{getUIConfig().headerMyOrdersLabel}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/favoritos">{getUIConfig().headerFavoritesLabel}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    {getUIConfig().headerLogoutLabel}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    {getUIConfig().headerLoginLabel}
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/registro">
                    <UserPlus className="h-4 w-4 mr-2" />
                    {getUIConfig().headerRegisterLabel}
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
                    placeholder={getUIConfig().searchPlaceholder}
                    className="pl-10 pr-4"
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </form>

            <nav className="space-y-2 mb-4">
              {categoryGroups.map(([groupName, groupCategories]) => (
                <div key={groupName} className="space-y-1">
                  <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {groupName}
                  </p>
                  {groupCategories.map((category) => (
                    <div key={category.link || category.slug || category.name}>
                      <Link
                        to={category.link}
                        className="block py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <div className="ml-4 space-y-1">
                          {category.subcategories.map((sub) => (
                            <div key={sub.link || sub.slug || sub.name}>
                              <Link
                                to={sub.link}
                                className="block py-1 text-xs text-muted-foreground transition-colors hover:text-primary"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {sub.name}
                              </Link>
                              {sub.subcategories && sub.subcategories.length > 0 && (
                                <div className="ml-4 space-y-0.5">
                                  {sub.subcategories.map((subsub) => (
                                    <Link
                                      key={subsub.link || subsub.slug || subsub.name}
                                      to={subsub.link}
                                      className="block py-0.5 text-xs text-muted-foreground/70 transition-colors hover:text-primary"
                                      onClick={() => setIsMenuOpen(false)}
                                    >
                                      {subsub.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              <Link
                to="/productos"
                className="block py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                {getUIConfig().headerAllProductsLabel}
              </Link>
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
                      {getUIConfig().headerMyProfileLabel}
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to="/pedidos" onClick={() => setIsMenuOpen(false)}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {getUIConfig().headerMyOrdersLabel}
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to="/favoritos" onClick={() => setIsMenuOpen(false)}>
                      <Heart className="h-4 w-4 mr-2" />
                      {getUIConfig().headerFavoritesLabel}
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50" 
                    onClick={handleLogout}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    {getUIConfig().headerLogoutLabel}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <LogIn className="h-4 w-4 mr-2" />
                      {getUIConfig().headerLoginLabel}
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" asChild>
                    <Link to="/registro" onClick={() => setIsMenuOpen(false)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      {getUIConfig().headerRegisterLabel}
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
