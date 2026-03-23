/**
 * Servicio de carrito - Solo lógica local
 * 
 * NOTA: No existe un endpoint de carrito en la API (documentacion.md).
 * El carrito se maneja completamente en el cliente (Zustand + localStorage).
 * La validación de stock se hace al crear la orden via POST /sales-orders/validate-stock.
 */

export class CartService {
  // El carrito es 100% local — no hay API de carrito en el backend
}

export const cartService = new CartService();
