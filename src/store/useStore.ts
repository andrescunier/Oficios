/**
 * Store global de la aplicación usando Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  User, 
  Product, 
  ProductVariant,
  CartItem, 
  Cart, 
  Account 
} from '@/types/api';
import { httpClient } from '@/services/httpClient';
import { favoritesService } from '@/services/favoritesService';
import { cartSyncService, type CartSnapshot } from '@/services/cartSyncService';
import log from '@/lib/logger';
import { getBusinessConfig } from '@/config/runtime';
import {
  clearAuthSession,
  getAuthIntegrityIssue,
  getBusinessPartnerId,
  saveAccountSession,
} from '@/features/auth/session';
import {
  adoptOrClaimSessionFromStorage,
  claimActiveSession,
  releaseActiveSession,
} from '@/features/auth/activeSession';
import { recordAppEvent } from '@/lib/observability';

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
  addToCart: (product: Product, quantity: number, variant?: ProductVariant) => void;
  removeFromCart: (lineId: string) => void;
  updateCartQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  calculateCartTotals: () => void;
  syncRuntimeConfig: () => void;

  
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

  // Persist/hydration
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
}

// Configuración inicial
const initialAuthState: AuthState = {
  user: null,
  account: null,
  isAuthenticated: false,
  token: null,
};

const createInitialCartState = (): CartState => ({
  items: [],
  subtotal: 0,
  tax_amount: 0,
  total_amount: 0,
  currency: getBusinessConfig().defaultCurrency,
});

const initialUIState: UIState = {
  isLoading: false,
  error: null,
  notifications: [],
  theme: 'light',
  sidebarOpen: false,
};

// Helper para calcular totales del carrito
const calculateTotals = (items: CartItem[], currency: string = getBusinessConfig().defaultCurrency): CartState => {
  const businessCfg = getBusinessConfig();
  const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const tax_amount = subtotal * businessCfg.defaultTaxRate;
  const total_amount = subtotal + tax_amount;
  
  return {
    items,
    subtotal,
    tax_amount,
    total_amount,
    currency,
  };
};

// Límite máximo de unidades por producto (desde config)
const getMaxQuantityPerProduct = () => getBusinessConfig().maxQuantityPerProduct;

const buildCartLineId = (productId: string, variantId?: string) =>
  variantId ? `${productId}::${variantId}` : productId;

// Cache local de favoritos por usuario.
// Fuente de verdad: backend (customer_favorites). Esto es solo para hidratación inmediata
// y modo offline; toda mutación se sincroniza vía favoritesService.
const FAVORITES_STORAGE_KEY = 'diapstore-user-favorites';

const getUserFavoritesKey = (userId: string) => `${FAVORITES_STORAGE_KEY}-${userId}`;

const loadCachedFavorites = (userId: string): string[] => {
  try {
    const stored = localStorage.getItem(getUserFavoritesKey(userId));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const cacheFavorites = (userId: string, favorites: string[]) => {
  try {
    localStorage.setItem(getUserFavoritesKey(userId), JSON.stringify(favorites));
  } catch (e) {
    log.store.error('Error caching favorites:', e);
  }
};

const hydrateFavoritesFromBackend = async (userId: string, businessPartnerId: string | null) => {
  if (!businessPartnerId) return;
  try {
    const remote = await favoritesService.list(businessPartnerId);
    cacheFavorites(userId, remote);
    useStore.setState({ favorites: remote });
  } catch (error) {
    log.store.error('hydrateFavoritesFromBackend error:', error);
  }
};

// =============================================================================
// Sincronización del carrito con el backend (customer_carts).
// Estrategia: snapshot completo PUT debounced (700ms) tras cada mutación local.
// Hidratación en login: si el backend tiene snapshot, reemplaza el carrito local.
// =============================================================================

let cartSyncTimer: ReturnType<typeof setTimeout> | null = null;

const buildCartSnapshot = (cart: CartState): CartSnapshot => ({
  items: cart.items.map((item) => ({
    line_id: item.line_id,
    product_id: item.product?.id,
    variant_id: item.variant?.id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    selected_options: item.selected_options,
    snapshot: {
      name: item.product?.name,
      image_url: item.product?.image_url || item.product?.thumbnail_url || null,
      sku: item.variant?.sku || item.product?.sku,
      currency: item.product?.currency,
    },
  })),
  currency: cart.currency,
});

const scheduleCartSync = () => {
  if (typeof window === 'undefined') return;
  const bpId = getBusinessPartnerId();
  if (!bpId) return;
  if (cartSyncTimer) clearTimeout(cartSyncTimer);
  cartSyncTimer = setTimeout(() => {
    cartSyncTimer = null;
    const state = useStore.getState();
    if (!state.auth.isAuthenticated) return;
    const currentBp = getBusinessPartnerId();
    if (!currentBp) return;
    if (state.cart.items.length === 0) {
      void cartSyncService.clear(currentBp);
    } else {
      void cartSyncService.save(currentBp, buildCartSnapshot(state.cart));
    }
  }, 700);
};

const hydrateCartFromBackend = async (businessPartnerId: string | null) => {
  if (!businessPartnerId) return;
  try {
    const remote = await cartSyncService.fetch(businessPartnerId);
    if (!remote || !Array.isArray(remote.items) || remote.items.length === 0) return;

    // Reconstruir CartItem[] desde el snapshot. Usamos los datos embebidos en `snapshot`
    // como respaldo si el catálogo cambió. Stock/precio se re-validan en checkout.
    const rebuiltItems: CartItem[] = remote.items
      .map((raw: any): CartItem | null => {
        if (!raw?.product_id || typeof raw.quantity !== 'number') return null;
        const snap = raw.snapshot || {};
        const product = {
          id: raw.product_id,
          sku: snap.sku || raw.product_id,
          name: snap.name || 'Producto',
          unit_price: typeof raw.unit_price === 'number' ? raw.unit_price : 0,
          currency: snap.currency || remote.currency || getBusinessConfig().defaultCurrency,
          tax_rate: 0,
          image_url: snap.image_url || undefined,
        } as unknown as Product;
        const variant = raw.variant_id
          ? ({ id: raw.variant_id, sku: snap.sku, name: snap.name, unit_price: raw.unit_price } as unknown as ProductVariant)
          : undefined;
        return {
          line_id: raw.line_id || buildCartLineId(raw.product_id, raw.variant_id),
          product,
          variant,
          selected_options: raw.selected_options,
          quantity: raw.quantity,
          unit_price: typeof raw.unit_price === 'number' ? raw.unit_price : 0,
        };
      })
      .filter((x): x is CartItem => x !== null);

    if (rebuiltItems.length === 0) return;

    const merged = calculateTotals(
      rebuiltItems,
      remote.currency || getBusinessConfig().defaultCurrency,
    );
    useStore.setState({ cart: merged });
  } catch (error) {
    log.store.error('hydrateCartFromBackend error:', error);
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
        const resolvedAccount = account || get().auth.account || null;
        if (resolvedAccount?.id) {
          httpClient.setAccountId(resolvedAccount.id);
          saveAccountSession(resolvedAccount);
        }
        
        // Hidratación inmediata desde caché local + refresh desde backend
        const cached = loadCachedFavorites(user.id);

        set(() => ({
          auth: {
            user,
            account: resolvedAccount,
            isAuthenticated: true,
            token,
          },
          favorites: cached,
        }));

        // Sincronizar con backend (no bloqueante)
        void hydrateFavoritesFromBackend(user.id, getBusinessPartnerId());
        void hydrateCartFromBackend(getBusinessPartnerId());

        // Marcar esta como la única sesión activa para este usuario en este browser.
        // Cualquier otra pestaña/sesión previa recibirá el aviso y hará logout.
        claimActiveSession();
      },
      
      logout: () => {
        // Remover token del cliente HTTP
        httpClient.removeAuthToken();
        httpClient.removeAccountId();
        
        clearAuthSession({ removeAuthToken: () => httpClient.removeAuthToken() });
        
        // Cancelar sync pendiente del carrito (no queremos PUT post-logout)
        if (cartSyncTimer) {
          clearTimeout(cartSyncTimer);
          cartSyncTimer = null;
        }

        releaseActiveSession();
        
        set({
          auth: initialAuthState,
          // NO limpiamos el carrito: queda en localStorage para que al volver a loguearse
          // (mismo dispositivo) lo encuentre. Si entra en otro dispositivo, lo trae el backend.
          favorites: [], // Limpiar favoritos al logout (se mantienen guardados en localStorage por usuario)
        });
      },
      
      // Cart state
      cart: createInitialCartState(),
      
      addToCart: (product, quantity, variant) => {
        set((state) => {
          const lineId = buildCartLineId(product.id, variant?.id);
          const existingItem = state.cart.items.find(item => item.line_id === lineId);
          const currentQuantity = existingItem ? existingItem.quantity : 0;
          const newQuantity = currentQuantity + quantity;
          const unitPrice = variant?.effective_price ?? variant?.unit_price ?? product.unit_price;
          const displayName = variant?.name || product.name;
          
          const maxQuantityPerProduct = getMaxQuantityPerProduct();

          // Verificar límite de unidades por producto
          if (newQuantity > maxQuantityPerProduct) {
            get().addNotification({
              type: 'warning',
              title: 'Límite alcanzado',
              message: `Máximo ${maxQuantityPerProduct} unidades por producto. Ya tienes ${currentQuantity} en el carrito.`,
              duration: 4000,
            });
            
            // Si ya tiene el máximo, no agregar más
            if (currentQuantity >= maxQuantityPerProduct) {
              return state;
            }
            
            // Ajustar cantidad al máximo permitido
            const adjustedQuantity = maxQuantityPerProduct - currentQuantity;
            if (adjustedQuantity <= 0) {
              return state;
            }
            
            let newItems: CartItem[];
            if (existingItem) {
              newItems = state.cart.items.map(item =>
                item.line_id === lineId
                  ? { ...item, quantity: maxQuantityPerProduct }
                  : item
              );
            } else {
              newItems = [...state.cart.items, {
                line_id: lineId,
                product,
                variant,
                selected_options: variant?.option_values,
                quantity: adjustedQuantity,
                unit_price: unitPrice,
              }];
            }
            
            const newCart = calculateTotals(newItems, state.cart.currency);
            return { cart: newCart };
          }
          
          let newItems: CartItem[];
          if (existingItem) {
            newItems = state.cart.items.map(item =>
              item.line_id === lineId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            newItems = [...state.cart.items, {
              line_id: lineId,
              product,
              variant,
              selected_options: variant?.option_values,
              quantity,
              unit_price: unitPrice,
            }];
          }
          
          const newCart = calculateTotals(newItems, state.cart.currency);
          recordAppEvent('add_to_cart', {
            productId: product.id,
            quantity,
            variantId: variant?.id || null,
          });
          
          // Agregar notificación
          get().addNotification({
            type: 'success',
            title: 'Producto agregado',
            message: `${displayName} agregado al carrito`,
            duration: 3000,
          });
          
          return { cart: newCart };
        });

        scheduleCartSync();
      },
      
      removeFromCart: (lineId) => {
        set((state) => {
          const newItems = state.cart.items.filter(item => item.line_id !== lineId);
          const newCart = calculateTotals(newItems, state.cart.currency);
          
          get().addNotification({
            type: 'info',
            title: 'Producto eliminado',
            message: 'Producto eliminado del carrito',
            duration: 3000,
          });
          
          return { cart: newCart };
        });
        scheduleCartSync();
      },
      
      updateCartQuantity: (lineId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            // Si la cantidad es 0 o menos, eliminar el producto
            const newItems = state.cart.items.filter(item => item.line_id !== lineId);
            const newCart = calculateTotals(newItems, state.cart.currency);
            return { cart: newCart };
          }
          
          const maxQuantityPerProduct = getMaxQuantityPerProduct();

          // Verificar límite de unidades por producto
          if (quantity > maxQuantityPerProduct) {
            get().addNotification({
              type: 'warning',
              title: 'Límite alcanzado',
              message: `Máximo ${maxQuantityPerProduct} unidades por producto`,
              duration: 3000,
            });
            quantity = maxQuantityPerProduct;
          }
          
          const newItems = state.cart.items.map(item =>
            item.line_id === lineId
              ? { ...item, quantity }
              : item
          );
          
          const newCart = calculateTotals(newItems, state.cart.currency);
          return { cart: newCart };
        });
        scheduleCartSync();
      },
      
      clearCart: () => {
        set({ cart: createInitialCartState() });
        // Cancelar PUT pendiente y limpiar el snapshot remoto inmediatamente.
        if (cartSyncTimer) {
          clearTimeout(cartSyncTimer);
          cartSyncTimer = null;
        }
        const bpId = getBusinessPartnerId();
        if (bpId) void cartSyncService.clear(bpId);
      },
      
      calculateCartTotals: () => set((state) => {
        const newCart = calculateTotals(state.cart.items, state.cart.currency);
        return { cart: newCart };
      }),

      syncRuntimeConfig: () => set((state) => {
        const businessConfig = getBusinessConfig();
        const currency = state.cart.items.length > 0
          ? state.cart.currency || businessConfig.defaultCurrency
          : businessConfig.defaultCurrency;

        return {
          cart: calculateTotals(state.cart.items, currency),
        };
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
      
      addToFavorites: (productId) => {
        const state = get();
        if (state.favorites.includes(productId)) return;

        // Update optimista
        const newFavorites = [...state.favorites, productId];
        set({ favorites: newFavorites });

        const userId = state.auth.user?.id;
        if (userId) cacheFavorites(userId, newFavorites);

        get().addNotification({
          type: 'success',
          title: 'Agregado a favoritos',
          message: 'Producto agregado a tus favoritos',
          duration: 3000,
        });

        // Sync backend; revertir si falla
        const bpId = getBusinessPartnerId();
        if (bpId) {
          void favoritesService.add(bpId, productId).then((ok) => {
            if (!ok) {
              const reverted = get().favorites.filter((id) => id !== productId);
              set({ favorites: reverted });
              if (userId) cacheFavorites(userId, reverted);
              get().addNotification({
                type: 'error',
                title: 'No se pudo guardar',
                message: 'No pudimos sincronizar tu favorito. Intentá de nuevo.',
                duration: 4000,
              });
            }
          });
        }
      },

      removeFromFavorites: (productId) => {
        const state = get();
        if (!state.favorites.includes(productId)) return;

        // Update optimista
        const newFavorites = state.favorites.filter((id) => id !== productId);
        set({ favorites: newFavorites });

        const userId = state.auth.user?.id;
        if (userId) cacheFavorites(userId, newFavorites);

        // Sync backend; revertir si falla
        const bpId = getBusinessPartnerId();
        if (bpId) {
          void favoritesService.remove(bpId, productId).then((ok) => {
            if (!ok) {
              const reverted = [...get().favorites, productId];
              set({ favorites: reverted });
              if (userId) cacheFavorites(userId, reverted);
              get().addNotification({
                type: 'error',
                title: 'No se pudo eliminar',
                message: 'No pudimos sincronizar la eliminación. Intentá de nuevo.',
                duration: 4000,
              });
            }
          });
        }
      },
      
      isFavorite: (productId) => get().favorites.includes(productId),
      
      // Recent products
      recentProducts: [],

      addToRecent: (productId) => set((state) => {
        const filtered = state.recentProducts.filter(id => id !== productId);
        const newRecent = [productId, ...filtered].slice(0, 10); // Máximo 10 productos recientes
        
        return { recentProducts: newRecent };
      }),

      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
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
      merge: (persistedState, currentState) => {
        if (!persistedState) return currentState;
        const persisted = persistedState as Partial<AppStore>;
        return {
          ...currentState,
          ...persisted,
          // Deep-merge ui para no perder notifications, isLoading, etc.
          ui: {
            ...currentState.ui,
            ...(persisted.ui || {}),
          },
        };
      },
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            log.store.error('Error al hidratar store:', error);
            clearAuthSession({ removeAuthToken: () => httpClient.removeAuthToken() });
            queueMicrotask(() => useStore.setState({ hasHydrated: true }));
            return;
          }

          if (!state) {
            log.store.info('No hay estado para hidratar');
            queueMicrotask(() => useStore.setState({ hasHydrated: true }));
            return;
          }

          // Validar integridad del estado antes de configurar
          const integrityIssue = getAuthIntegrityIssue(state.auth);

          if (integrityIssue) {
            log.store.error('Estado inconsistente detectado durante hidratación!');
            log.store.debug('Estado inconsistente:', {
              issue: integrityIssue,
              isAuthenticated: state.auth?.isAuthenticated,
              hasToken: !!state.auth?.token,
              tokenLength: state.auth?.token?.length,
              hasUser: !!state.auth?.user,
            });
            
            // Resetear auth en memoria Y limpiar storage
            queueMicrotask(() => useStore.setState({
              auth: initialAuthState,
              cart: createInitialCartState(),
              hasHydrated: true,
            }));
            clearAuthSession({
              redirect: '/login?session=corrupted_hydration',
              removeAuthToken: () => httpClient.removeAuthToken(),
            });
            return;
          }

          // Solo configurar token si todo está OK
          if (state.auth?.token && state.auth?.isAuthenticated && state.auth?.user) {
            log.store.info('Configurando token desde hidratación');
            httpClient.setAuthToken(state.auth.token);
            if (state.auth.account?.id) {
              httpClient.setAccountId(state.auth.account.id);
            }
          } else {
            log.store.info('No hay sesión válida para hidratar');
            httpClient.removeAuthToken();
            httpClient.removeAccountId();
          }

          queueMicrotask(() => useStore.setState({ hasHydrated: true }));
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
  state.cart.items.find(item => item.product.id === productId && !item.variant)
);

// Función para inicializar la autenticación al cargar la aplicación
export const initializeAuth = () => {
  const store = useStore.getState();
  store.syncRuntimeConfig();
  
  const integrityIssue = getAuthIntegrityIssue(store.auth);
  
  if (integrityIssue) {
    log.store.error('ESTADO INCONSISTENTE DETECTADO - Limpiando todo...');
    log.store.debug('Estado:', {
      issue: integrityIssue,
      isAuthenticated: store.auth.isAuthenticated,
      hasToken: !!store.auth.token,
      hasUser: !!store.auth.user,
    });
    
    // Forzar limpieza total
    store.logout();
    clearAuthSession({
      redirect: '/login?session=corrupted',
      removeAuthToken: () => httpClient.removeAuthToken(),
    });
    return;
  }
  
  // Si hay token y está marcado como autenticado
  if (store.auth.token && store.auth.isAuthenticated) {
    // Configurar token en httpClient
    httpClient.setAuthToken(store.auth.token);
    if (store.auth.account?.id) {
      httpClient.setAccountId(store.auth.account.id);
    }
    // Adoptar el id de sesión activa persistido (o registrar uno nuevo si no existía).
    adoptOrClaimSessionFromStorage();
    log.store.info('Sesión restaurada correctamente', {
      user: store.auth.user?.email,
      tokenLength: store.auth.token.length,
    });
  } else {
    // No hay sesión - asegurarse que esté limpio
    httpClient.removeAuthToken();
    httpClient.removeAccountId();
    log.store.info('No hay sesión activa');
  }
};
