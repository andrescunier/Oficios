/**
 * Store global de la aplicación usando Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  User, 
  Product, 
  CartItem, 
  Cart, 
  BusinessPartner,
  Account 
} from '@/types/api';
// cartService eliminado — no existe API de carrito en el backend (ver documentacion.md)
import { httpClient } from '@/services/httpClient';
import { authService } from '@/services/authService';
import log from '@/lib/logger';

// Tipos del store
interface AuthState {
  user: User | null;
  account: Account | null;
  isAuthenticated: boolean;
  token: string | null;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
}

interface UIState {
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Store principal
interface AppStore {
  // Auth state
  auth: AuthState;
  setAuth: (auth: Partial<AuthState>) => void;
  login: (user: User, token: string, account?: Account) => void;
  logout: () => void;
  
  // Cart state
  cart: CartState;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  calculateCartTotals: () => void;

  
  // UI state
  ui: UIState;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  
  // Favorites
  favorites: string[];
  addToFavorites: (productId: string) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  
  // Recent products
  recentProducts: string[];
  addToRecent: (productId: string) => void;
}

// Configuración inicial
const initialAuthState: AuthState = {
  user: null,
  account: null,
  isAuthenticated: false,
  token: null,
};

const initialCartState: CartState = {
  items: [],
  subtotal: 0,
  tax_amount: 0,
  total_amount: 0,
  currency: 'ARS',
};

const initialUIState: UIState = {
  isLoading: false,
  error: null,
  notifications: [],
  theme: 'light',
  sidebarOpen: false,
};

// Helper para calcular totales del carrito
const calculateTotals = (items: CartItem[], currency: string = 'ARS'): CartState => {
  const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const tax_amount = subtotal * 0.105; // 10.5% IVA
  const total_amount = subtotal + tax_amount;
  
  return {
    items,
    subtotal,
    tax_amount,
    total_amount,
    currency,
  };
};

// Límite máximo de unidades por producto
const MAX_QUANTITY_PER_PRODUCT = 5;

// Funciones helper para favoritos por usuario
const FAVORITES_STORAGE_KEY = 'diapstore-user-favorites';

const getUserFavoritesKey = (userId: string) => `${FAVORITES_STORAGE_KEY}-${userId}`;

const loadUserFavorites = (userId: string): string[] => {
  try {
    const stored = localStorage.getItem(getUserFavoritesKey(userId));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveUserFavorites = (userId: string, favorites: string[]) => {
  try {
    localStorage.setItem(getUserFavoritesKey(userId), JSON.stringify(favorites));
  } catch (e) {
    log.store.error('Error saving favorites:', e);
  }
};

// Store principal
export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Auth state
      auth: initialAuthState,
      
      setAuth: (auth) => set((state) => ({
        auth: { ...state.auth, ...auth }
      })),
      
      login: (user, token, account) => {
        // Configurar token en el cliente HTTP
        httpClient.setAuthToken(token);
        
        // Cargar favoritos del usuario
        const userFavorites = loadUserFavorites(user.id);
        
        set((state) => ({
          auth: {
            user,
            account: account || state.auth.account,
            isAuthenticated: true,
            token,
          },
          favorites: userFavorites, // Cargar favoritos del usuario
        }));
        
        // Después del login, obtener el perfil completo con business_partner_id
        authService.getMe().then((meResponse) => {
          if (meResponse?.success && meResponse.data) {
            // Intentar obtener business_partner_id de múltiples ubicaciones
            const bpId = meResponse.data.billing?.business_partner_id
              || (meResponse.data as any).business_partner_id
              || (meResponse.data as any).partner_id;
            if (bpId) {
              localStorage.setItem('business_partner_id', bpId);
              log.auth.info('Business Partner ID obtenido de /auth/me:', bpId);
            } else if (!localStorage.getItem('business_partner_id')) {
              log.auth.warn('/auth/me no devolvió business_partner_id, usando user.id como fallback');
            }
            
            // Actualizar datos del usuario con la información de person
            if (meResponse.data.person) {
              set((state) => ({
                auth: {
                  ...state.auth,
                  user: state.auth.user ? {
                    ...state.auth.user,
                    person: {
                      first_name: meResponse.data.person?.first_name || '',
                      last_name: meResponse.data.person?.last_name || '',
                      phone: meResponse.data.person?.phone,
                    }
                  } : null
                }
              }));
            }
          }
        }).catch((err) => log.auth.error('Error en getMe post-login:', err));
        

      },
      
      logout: () => {
        // Remover token del cliente HTTP
        httpClient.removeAuthToken();
        
        // Limpiar business_partner_id
        localStorage.removeItem('business_partner_id');
        
        set({
          auth: initialAuthState,
          cart: initialCartState, // Limpiar carrito al logout
          favorites: [], // Limpiar favoritos al logout (se mantienen guardados en localStorage por usuario)
        });
      },
      
      // Cart state
      cart: initialCartState,
      
      addToCart: (product, quantity) => {
        set((state) => {
          const existingItem = state.cart.items.find(item => item.product.id === product.id);
          const currentQuantity = existingItem ? existingItem.quantity : 0;
          const newQuantity = currentQuantity + quantity;
          
          // Verificar límite de 5 unidades por producto
          if (newQuantity > MAX_QUANTITY_PER_PRODUCT) {
            get().addNotification({
              type: 'warning',
              title: 'Límite alcanzado',
              message: `Máximo ${MAX_QUANTITY_PER_PRODUCT} unidades por producto. Ya tienes ${currentQuantity} en el carrito.`,
              duration: 4000,
            });
            
            // Si ya tiene el máximo, no agregar más
            if (currentQuantity >= MAX_QUANTITY_PER_PRODUCT) {
              return state;
            }
            
            // Ajustar cantidad al máximo permitido
            const adjustedQuantity = MAX_QUANTITY_PER_PRODUCT - currentQuantity;
            if (adjustedQuantity <= 0) {
              return state;
            }
            
            let newItems: CartItem[];
            if (existingItem) {
              newItems = state.cart.items.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: MAX_QUANTITY_PER_PRODUCT }
                  : item
              );
            } else {
              newItems = [...state.cart.items, {
                product,
                quantity: adjustedQuantity,
                unit_price: product.unit_price,
              }];
            }
            
            const newCart = calculateTotals(newItems, state.cart.currency);
            return { cart: newCart };
          }
          
          let newItems: CartItem[];
          if (existingItem) {
            newItems = state.cart.items.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            newItems = [...state.cart.items, {
              product,
              quantity,
              unit_price: product.unit_price,
            }];
          }
          
          const newCart = calculateTotals(newItems, state.cart.currency);
          
          // Agregar notificación
          get().addNotification({
            type: 'success',
            title: 'Producto agregado',
            message: `${product.name} agregado al carrito`,
            duration: 3000,
          });
          
          return { cart: newCart };
        });


      },
      
      removeFromCart: (productId) => set((state) => {
        const newItems = state.cart.items.filter(item => item.product.id !== productId);
        const newCart = calculateTotals(newItems, state.cart.currency);
        
        get().addNotification({
          type: 'info',
          title: 'Producto eliminado',
          message: 'Producto eliminado del carrito',
          duration: 3000,
        });
        
        return { cart: newCart };
      }),
      
      updateCartQuantity: (productId, quantity) => set((state) => {
        if (quantity <= 0) {
          // Si la cantidad es 0 o menos, eliminar el producto
          const newItems = state.cart.items.filter(item => item.product.id !== productId);
          const newCart = calculateTotals(newItems, state.cart.currency);
          return { cart: newCart };
        }
        
        // Verificar límite de 5 unidades por producto
        if (quantity > MAX_QUANTITY_PER_PRODUCT) {
          get().addNotification({
            type: 'warning',
            title: 'Límite alcanzado',
            message: `Máximo ${MAX_QUANTITY_PER_PRODUCT} unidades por producto`,
            duration: 3000,
          });
          quantity = MAX_QUANTITY_PER_PRODUCT;
        }
        
        const newItems = state.cart.items.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        );
        
        const newCart = calculateTotals(newItems, state.cart.currency);
        return { cart: newCart };
      }),
      
      clearCart: () => set({
        cart: initialCartState,
      }),
      
      calculateCartTotals: () => set((state) => {
        const newCart = calculateTotals(state.cart.items, state.cart.currency);
        return { cart: newCart };
      }),


      
      // UI state
      ui: initialUIState,
      
      setLoading: (loading) => set((state) => ({
        ui: { ...state.ui, isLoading: loading }
      })),
      
      setError: (error) => set((state) => ({
        ui: { ...state.ui, error }
      })),
      
      addNotification: (notification) => set((state) => {
        const id = Date.now().toString();
        const newNotification = { ...notification, id };
        
        // Asegurar que notifications existe como array
        const currentNotifications = Array.isArray(state.ui?.notifications) ? state.ui.notifications : [];
        
        return {
          ui: {
            ...state.ui,
            notifications: [...currentNotifications, newNotification]
          }
        };
      }),
      
      removeNotification: (id) => set((state) => ({
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(n => n.id !== id)
        }
      })),
      
      clearNotifications: () => set((state) => ({
        ui: { ...state.ui, notifications: [] }
      })),
      
      setTheme: (theme) => set((state) => ({
        ui: { ...state.ui, theme }
      })),
      
      toggleSidebar: () => set((state) => ({
        ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen }
      })),
      
      // Favorites
      favorites: [],
      
      addToFavorites: (productId) => set((state) => {
        if (!state.favorites.includes(productId)) {
          const newFavorites = [...state.favorites, productId];
          
          // Persistir en localStorage por usuario
          const userId = state.auth.user?.id;
          if (userId) {
            saveUserFavorites(userId, newFavorites);
          }
          
          get().addNotification({
            type: 'success',
            title: 'Agregado a favoritos',
            message: 'Producto agregado a tus favoritos',
            duration: 3000,
          });
          
          return { favorites: newFavorites };
        }
        return state;
      }),
      
      removeFromFavorites: (productId) => set((state) => {
        const newFavorites = state.favorites.filter(id => id !== productId);
        
        // Persistir en localStorage por usuario
        const userId = state.auth.user?.id;
        if (userId) {
          saveUserFavorites(userId, newFavorites);
        }
        
        return { favorites: newFavorites };
      }),
      
      isFavorite: (productId) => get().favorites.includes(productId),
      
      // Recent products
      recentProducts: [],
      
      addToRecent: (productId) => set((state) => {
        const filtered = state.recentProducts.filter(id => id !== productId);
        const newRecent = [productId, ...filtered].slice(0, 10); // Máximo 10 productos recientes
        
        return { recentProducts: newRecent };
      }),
    }),
    {
      name: 'diapstore-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        auth: state.auth,
        cart: state.cart,
        favorites: state.favorites,
        recentProducts: state.recentProducts,
        ui: {
          theme: state.ui.theme,
        },
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            log.store.error('Error al hidratar store:', error);
            localStorage.removeItem('diapstore-store');
            return;
          }

          if (!state) {
            log.store.info('No hay estado para hidratar');
            return;
          }

          // Validar integridad del estado antes de configurar
          const hasInconsistentState = 
            (state.auth?.isAuthenticated && !state.auth?.token) ||
            (state.auth?.isAuthenticated && !state.auth?.user) ||
            (!state.auth?.isAuthenticated && state.auth?.token) ||
            (state.auth?.token && state.auth.token.length < 10);

          if (hasInconsistentState) {
            log.store.error('Estado inconsistente detectado durante hidratación!');
            log.store.debug('Estado inconsistente:', {
              isAuthenticated: state.auth?.isAuthenticated,
              hasToken: !!state.auth?.token,
              tokenLength: state.auth?.token?.length,
              hasUser: !!state.auth?.user,
            });
            
            // Limpiar estado corrupto
            localStorage.removeItem('diapstore-store');
            sessionStorage.clear();
            httpClient.removeAuthToken();
            
            // Forzar recarga
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
              window.location.href = '/login?session=corrupted_hydration';
            }
            return;
          }

          // Solo configurar token si todo está OK
          if (state.auth?.token && state.auth?.isAuthenticated && state.auth?.user) {
            log.store.info('Configurando token desde hidratación');
            httpClient.setAuthToken(state.auth.token);
          } else {
            log.store.info('No hay sesión válida para hidratar');
            httpClient.removeAuthToken();
          }
        };
      },
    }
  )
);

// Hooks específicos para partes del store
export const useAuth = () => useStore((state) => state.auth);
export const useCart = () => useStore((state) => state.cart);
export const useUI = () => useStore((state) => state.ui);
export const useFavorites = () => useStore((state) => state.favorites);

// Selectores útiles
export const useCartItemCount = () => useStore((state) => 
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
);

export const useIsProductInCart = (productId: string) => useStore((state) =>
  state.cart.items.some(item => item.product.id === productId)
);

export const useCartItem = (productId: string) => useStore((state) =>
  state.cart.items.find(item => item.product.id === productId)
);

// Función para inicializar la autenticación al cargar la aplicación
export const initializeAuth = () => {
  const store = useStore.getState();
  
  // Primero: verificar si hay inconsistencia en el estado
  const hasInconsistentState = 
    (store.auth.isAuthenticated && !store.auth.token) ||
    (store.auth.isAuthenticated && !store.auth.user) ||
    (!store.auth.isAuthenticated && store.auth.token);
  
  if (hasInconsistentState) {
    log.store.error('ESTADO INCONSISTENTE DETECTADO - Limpiando todo...');
    log.store.debug('Estado:', {
      isAuthenticated: store.auth.isAuthenticated,
      hasToken: !!store.auth.token,
      hasUser: !!store.auth.user,
    });
    
    // Forzar limpieza total
    store.logout();
    localStorage.clear();
    sessionStorage.clear();
    httpClient.removeAuthToken();
    
    // Forzar recarga para reiniciar React
    if (typeof window !== 'undefined') {
      log.store.info('Recargando página para limpiar estado...');
      window.location.href = '/login?session=corrupted';
    }
    return;
  }
  
  // Si hay token y está marcado como autenticado
  if (store.auth.token && store.auth.isAuthenticated) {
    // Validar que el token no esté vacío o corrupto
    if (store.auth.token.length < 10 || !store.auth.user) {
      // Token inválido - limpiar todo
      log.store.warn('Token inválido detectado, limpiando sesión...');
      store.logout();
      localStorage.clear();
      sessionStorage.clear();
      httpClient.removeAuthToken();
      return;
    }
    
    // Configurar token en httpClient
    httpClient.setAuthToken(store.auth.token);
    log.store.info('Sesión restaurada correctamente', {
      user: store.auth.user?.email,
      tokenLength: store.auth.token.length,
    });
  } else {
    // No hay sesión - asegurarse que esté limpio
    httpClient.removeAuthToken();
    log.store.info('No hay sesión activa');
  }
};
