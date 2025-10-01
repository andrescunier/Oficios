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
      
      login: (user, token, account) => set((state) => ({
        auth: {
          user,
          account: account || state.auth.account,
          isAuthenticated: true,
          token,
        }
      })),
      
      logout: () => set({
        auth: initialAuthState,
        cart: initialCartState, // Limpiar carrito al logout
      }),
      
      // Cart state
      cart: initialCartState,
      
      addToCart: (product, quantity) => set((state) => {
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
      }),
      
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
      name: 'iamerican-store',
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
