/**
 * Drawer del carrito de compras
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  X,
  ArrowRight,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/store/useStore';
import { getBusinessConfig } from '@/config/runtime';
import log from '@/lib/logger';

interface CartDrawerProps {
  children: React.ReactNode;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ children }) => {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    addNotification,
    auth,
  } = useStore();

  const itemsCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.total_amount;
  log.cart.debug('CartDrawer render:', { itemsCount, total, currency: cart.currency });
  const businessCfg = getBusinessConfig();
  const freeShippingThreshold = businessCfg.freeShippingThreshold;
  const isEligibleForFreeShipping = total >= freeShippingThreshold;
  const amountForFreeShipping = freeShippingThreshold - total;

  const formatPrice = (price: number, currency?: string) => {
    if (typeof price !== 'number' || isNaN(price)) {
      return 'Precio no disponible';
    }
    const currencyCode = currency || businessCfg.defaultCurrency;
    
    return new Intl.NumberFormat(businessCfg.locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handleQuantityChange = (lineId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(lineId);
      addNotification({
        type: 'info',
        title: 'Producto eliminado',
        message: 'El producto fue eliminado del carrito',
      });
    } else {
      updateCartQuantity(lineId, newQuantity);
    }
  };

  const handleRemoveItem = (lineId: string) => {
    removeFromCart(lineId);
    addNotification({
      type: 'info',
      title: 'Producto eliminado',
      message: 'El producto fue eliminado del carrito',
    });
  };

  const handleClearCart = () => {
    clearCart();
    addNotification({
      type: 'info',
      title: 'Carrito vaciado',
      message: 'Todos los productos fueron eliminados',
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Carrito de Compras</span>
            {itemsCount > 0 && (
              <Badge variant="secondary">{itemsCount}</Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {itemsCount === 0 
              ? 'Tu carrito está vacío'
              : `${itemsCount} ${itemsCount === 1 ? 'producto' : 'productos'} en tu carrito`
            }
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Free shipping indicator */}
          {itemsCount > 0 && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2 text-green-600">
                <Package className="h-4 w-4" />
                <span className="text-sm font-medium">
                  ¡Envío gratis en todas tus compras!
                </span>
              </div>
            </div>
          )}

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto mt-4">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Tu carrito está vacío</h3>
                <p className="text-muted-foreground mb-4">
                  Agrega algunos productos para comenzar
                </p>
                <Link to="/productos">
                  <Button>
                    Explorar Productos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.line_id} className="flex space-x-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      <img
                        src={item.product.image_url || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium line-clamp-2 mb-1">
                        {item.variant?.name || item.product.name}
                      </h4>
                      {item.selected_options && Object.keys(item.selected_options).length > 0 && (
                        <p className="text-xs text-muted-foreground mb-1">
                          {Object.entries(item.selected_options).map(([key, value]) => `${key}: ${value}`).join(' • ')}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold">
                          {formatPrice(item.unit_price, item.product.currency)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveItem(item.line_id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleQuantityChange(item.line_id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleQuantityChange(item.line_id, item.quantity + 1)}
                          disabled={item.quantity >= (item.variant?.stock_quantity || item.product.stock_quantity || 0)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {item.quantity > 1 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Subtotal: {formatPrice(item.unit_price * item.quantity, item.product.currency)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart footer */}
          {cart.items.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Envío:</span>
                  <span className="font-medium">
                    {isEligibleForFreeShipping ? 'Gratis' : 'A calcular'}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-lg font-bold">{formatPrice(total)}</span>
                </div>
                
                <div className="space-y-2">
                  <Link to={auth.isAuthenticated ? "/checkout" : "/login"} state={!auth.isAuthenticated ? { from: '/checkout' } : undefined} className="w-full">
                    <Button className="w-full" size="lg">
                      {auth.isAuthenticated ? 'Proceder al Pago' : 'Iniciar Sesión para Comprar'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleClearCart}
                  >
                    Vaciar Carrito
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
