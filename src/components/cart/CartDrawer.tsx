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

interface CartDrawerProps {
  children: React.ReactNode;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ children }) => {
  const { 
    cart, 
    updateCartItemQuantity, 
    removeFromCart, 
    clearCart,
    getCartTotal,
    getCartItemsCount,
    addNotification 
  } = useStore();

  const itemsCount = getCartItemsCount();
  const total = getCartTotal();
  const freeShippingThreshold = 50000;
  const isEligibleForFreeShipping = total >= freeShippingThreshold;
  const amountForFreeShipping = freeShippingThreshold - total;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      addNotification({
        type: 'info',
        title: 'Producto eliminado',
        message: 'El producto fue eliminado del carrito',
      });
    } else {
      updateCartItemQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
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
              {isEligibleForFreeShipping ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <Package className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    ¡Felicitaciones! Tienes envío gratis
                  </span>
                </div>
              ) : (
                <div className="text-sm">
                  <p className="text-muted-foreground">
                    Agrega {formatPrice(amountForFreeShipping)} más para envío gratis
                  </p>
                  <div className="w-full bg-muted-foreground/20 rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((total / freeShippingThreshold) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto mt-4">
            {cart.length === 0 ? (
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
                {cart.map((item) => (
                  <div key={item.product.id} className="flex space-x-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      <img
                        src={item.product.image_url || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium line-clamp-2 mb-1">
                        {item.product.name}
                      </h4>
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold">
                          {formatPrice(item.product.unit_price)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveItem(item.product.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
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
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= (item.product.stock_quantity || 0)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {item.quantity > 1 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Subtotal: {formatPrice(item.product.unit_price * item.quantity)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart footer */}
          {cart.length > 0 && (
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
                  <Link to="/checkout" className="w-full">
                    <Button className="w-full" size="lg">
                      Proceder al Pago
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
