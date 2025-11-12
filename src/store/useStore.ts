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
import { cartService } from '@/services/cartService';
import { httpClient } from '@/services/httpClient';

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
  syncCartWithServer: () => Promise<void>;
  verifyCartItems: () => Promise<void>;
  saveCartForLater: () => Promise<void>;
  loadServerCart: () => Promise<void>;
  
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
  currency: 'USD',
};

const initialUIState: UIState = {
  isLoading: false,
  error: null,
  notifications: [],
  theme: 'light',
  sidebarOpen: false,
};

// Helper para calcular totales del carrito
const calculateTotals = (items: CartItem[], currency: string = 'USD'): CartState => {
  const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const tax_amount = subtotal * 0.21; // 21% IVA
  const total_amount = subtotal + tax_amount;
  
  return {
    items,
    subtotal,
    tax_amount,
    total_amount,
    currency,
  };
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
        
        set((state) => ({
          auth: {
            user,
            account: account || state.auth.account,
            isAuthenticated: true,
            token,
          }
        }));
        
        // Cargar carrito del servidor después del login
        setTimeout(() => {
          get().loadServerCart();
        }, 1000);
      },
      
      logout: () => {
        // Remover token del cliente HTTP
        httpClient.removeAuthToken();
        
        set({
          auth: initialAuthState,
          cart: initialCartState, // Limpiar carrito al logout
        });
      },
      
      // Cart state
      cart: initialCartState,
      
      addToCart: (product, quantity) => {
        set((state) => {
          const existingItem = state.cart.items.find(item => item.product.id === product.id);
          
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

        // Sincronizar con servidor si está autenticado
        const state = get();
        if (state.auth.isAuthenticated) {
          setTimeout(() => {
            get().syncCartWithServer();
          }, 500);
        }
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

      // Sincronización con servidor
      syncCartWithServer: async () => {
        const state = get();
        if (!state.auth.isAuthenticated || state.cart.items.length === 0) {
          return;
        }

        try {
          await cartService.syncCart(state.cart.items, state.cart.currency);
          
          get().addNotification({
            type: 'success',
            title: 'Carrito sincronizado',
            message: 'Carrito guardado en el servidor',
            duration: 3000,
          });
        } catch (error: any) {
          get().addNotification({
            type: 'error',
            title: 'Error de sincronización',
            message: error.message || 'No se pudo sincronizar el carrito',
            duration: 5000,
          });
        }
      },

      verifyCartItems: async () => {
        const state = get();
        if (state.cart.items.length === 0) {
          return;
        }

        try {
          get().setLoading(true);
          const result = await cartService.verifyCartItems(state.cart.items);
          
          if (!result.valid) {
            // Actualizar carrito con items válidos
            const newCart = calculateTotals(result.updated_items, state.cart.currency);
            set({ cart: newCart });

            // Mostrar advertencias
            result.warnings.forEach(warning => {
              get().addNotification({
                type: 'warning',
                title: 'Cambios en el carrito',
                message: warning,
                duration: 5000,
              });
            });
          }
        } catch (error: any) {
          get().addNotification({
            type: 'error',
            title: 'Error de verificación',
            message: error.message || 'No se pudo verificar el carrito',
            duration: 5000,
          });
        } finally {
          get().setLoading(false);
        }
      },

      saveCartForLater: async () => {
        const state = get();
        if (!state.auth.isAuthenticated || state.cart.items.length === 0) {
          get().addNotification({
            type: 'warning',
            title: 'Carrito vacío',
            message: 'No hay productos para guardar',
            duration: 3000,
          });
          return;
        }

        try {
          await cartService.saveCartForLater(state.cart.items, state.cart.currency);
          
          // Limpiar carrito local después de guardar
          set({ cart: initialCartState });
          
          get().addNotification({
            type: 'success',
            title: 'Carrito guardado',
            message: 'Carrito guardado para más tarde',
            duration: 3000,
          });
        } catch (error: any) {
          get().addNotification({
            type: 'error',
            title: 'Error al guardar',
            message: error.message || 'No se pudo guardar el carrito',
            duration: 5000,
          });
        }
      },

      loadServerCart: async () => {
        const state = get();
        if (!state.auth.isAuthenticated) {
          return;
        }

        try {
          const serverCart = await cartService.getServerCart();
          
          if (serverCart && serverCart.success) {
            const cartData = serverCart.data;
            set({
              cart: {
                items: cartData.items,
                subtotal: cartData.subtotal,
                tax_amount: cartData.tax_amount,
                total_amount: cartData.total_amount,
                currency: cartData.currency,
              }
            });

            get().addNotification({
              type: 'info',
              title: 'Carrito recuperado',
              message: 'Carrito cargado desde el servidor',
              duration: 3000,
            });
          }
        } catch (error: any) {
          // Error silencioso - no mostrar notificación si no hay carrito en servidor
        }
      },
      
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
          get().addNotification({
            type: 'success',
            title: 'Agregado a favoritos',
            message: 'Producto agregado a tus favoritos',
            duration: 3000,
          });
          
          return {
            favorites: [...state.favorites, productId]
          };
        }
        return state;
      }),
      
      removeFromFavorites: (productId) => set((state) => ({
        favorites: state.favorites.filter(id => id !== productId)
      })),
      
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
            console.error('❌ Error al hidratar store:', error);
            localStorage.removeItem('diapstore-store');
            return;
          }

          if (!state) {
            console.log('ℹ️ No hay estado para hidratar');
            return;
          }

          // Validar integridad del estado antes de configurar
          const hasInconsistentState = 
            (state.auth?.isAuthenticated && !state.auth?.token) ||
            (state.auth?.isAuthenticated && !state.auth?.user) ||
            (!state.auth?.isAuthenticated && state.auth?.token) ||
            (state.auth?.token && state.auth.token.length < 10);

          if (hasInconsistentState) {
            console.error('🔴 Estado inconsistente detectado durante hidratación!');
            console.log({
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
            console.log('✅ Configurando token desde hidratación');
            httpClient.setAuthToken(state.auth.token);
          } else {
            console.log('ℹ️ No hay sesión válida para hidratar');
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
    console.error('🔴 ESTADO INCONSISTENTE DETECTADO - Limpiando todo...');
    console.log({
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
      console.log('🔄 Recargando página para limpiar estado...');
      window.location.href = '/login?session=corrupted';
    }
    return;
  }
  
  // Si hay token y está marcado como autenticado
  if (store.auth.token && store.auth.isAuthenticated) {
    // Validar que el token no esté vacío o corrupto
    if (store.auth.token.length < 10 || !store.auth.user) {
      // Token inválido - limpiar todo
      console.warn('⚠️ Token inválido detectado, limpiando sesión...');
      store.logout();
      localStorage.clear();
      sessionStorage.clear();
      httpClient.removeAuthToken();
      return;
    }
    
    // Configurar token en httpClient
    httpClient.setAuthToken(store.auth.token);
    console.log('✅ Sesión restaurada correctamente', {
      user: store.auth.user?.email,
      tokenLength: store.auth.token.length,
    });
  } else {
    // No hay sesión - asegurarse que esté limpio
    httpClient.removeAuthToken();
    console.log('ℹ️ No hay sesión activa');
  }
};
