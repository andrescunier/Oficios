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
import { getBusinessConfig, getUIConfig, getShippingConfig } from '@/config/runtime';
import { getCheckoutShippingCharge } from '@/features/checkout/model';
import { getServiceListing } from '@/utils/serviceListing';
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
  const shippingAmount = getCheckoutShippingCharge(cart.subtotal);
  const total = cart.total_amount + shippingAmount;
  log.cart.debug('CartDrawer render:', { itemsCount, total, shippingAmount, currency: cart.currency });
  const businessCfg = getBusinessConfig();
  const uiCfg = getUIConfig();
  const shippingCfg = getShippingConfig();

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
        title: uiCfg.cartItemRemovedTitle,
        message: uiCfg.cartItemRemovedMessage,
      });
    } else {
      updateCartQuantity(lineId, newQuantity);
    }
  };

  const handleRemoveItem = (lineId: string) => {
    removeFromCart(lineId);
    addNotification({
      type: 'info',
      title: uiCfg.cartItemRemovedTitle,
      message: uiCfg.cartItemRemovedMessage,
    });
  };

  const handleClearCart = () => {
    clearCart();
    addNotification({
      type: 'info',
      title: uiCfg.cartClearedTitle,
      message: uiCfg.cartClearedMessage,
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="flex h-dvh max-h-dvh w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <SheetHeader className="shrink-0 border-b px-4 pr-12 pt-4 pb-3">
          <SheetTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>{uiCfg.cartTitle}</span>
            {itemsCount > 0 && (
              <Badge variant="secondary">{itemsCount}</Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {itemsCount === 0 
              ? uiCfg.cartDrawerEmptyDescription
              : `${itemsCount} ${itemsCount === 1 ? uiCfg.cartPageProductSingular : uiCfg.cartPageProductPlural} ${uiCfg.cartDrawerCountSuffix}`
            }
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          {/* Free shipping indicator */}
          {itemsCount > 0 && (
            <div className="shrink-0 px-4 pt-3">
              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center space-x-2 text-green-600">
                  <Package className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">
                    {shippingAmount > 0 ? shippingCfg.chargedMessage : shippingCfg.drawerMessage}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Cart items */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            {cart.items.length === 0 ? (
              <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
                <ShoppingCart className="mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-medium">{uiCfg.cartEmptyTitle}</h3>
                <p className="mb-4 text-muted-foreground">
                  {uiCfg.cartEmptyBody}
                </p>
                <Link to="/productos">
                  <Button>
                    {uiCfg.cartEmptyExploreLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.line_id} className="flex space-x-3 rounded-lg border p-3">
                    <div className="flex-shrink-0">
                      <img
                        src={item.product.image_url || '/placeholder-product.svg'}
                        alt={item.product.name}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h4 className="mb-1 line-clamp-2 text-sm font-medium">
                        {item.variant?.name || item.product.name}
                      </h4>
                      {!getServiceListing(item.product).isService && (item.variant?.sku || item.product.sku) && (
                        <p className="mb-0.5 text-xs text-muted-foreground/60">SKU: {item.variant?.sku || item.product.sku}</p>
                      )}
                      {item.selected_options && Object.keys(item.selected_options).length > 0 && (
                        <p className="mb-1 text-xs text-muted-foreground">
                          {Object.entries(item.selected_options).map(([key, value]) => `${key}: ${value}`).join(' • ')}
                        </p>
                      )}
                      
                      <div className="mb-2 flex items-center justify-between">
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
                      
                      {getServiceListing(item.product).isService ? (
                        <p className="text-xs text-muted-foreground">1 servicio · sin cantidad</p>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleQuantityChange(item.line_id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
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
                            <p className="mt-1 text-xs text-muted-foreground">
                              Subtotal: {formatPrice(item.unit_price * item.quantity, item.product.currency)}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart footer */}
          {cart.items.length > 0 && (
            <div className="shrink-0 border-t px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{uiCfg.cartDrawerSubtotalLabel}</span>
                  <span className="font-medium">{formatPrice(cart.total_amount)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{shippingCfg.label}:</span>
                  <span className="font-medium">
                    {shippingAmount > 0 ? formatPrice(shippingAmount) : shippingCfg.freeLabel}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">{uiCfg.cartDrawerTotalLabel}</span>
                  <span className="text-lg font-bold">{formatPrice(total)}</span>
                </div>
                
                <div className="space-y-2">
                  <Link to={auth.isAuthenticated ? "/checkout" : "/login"} state={!auth.isAuthenticated ? { from: '/checkout' } : undefined} className="w-full">
                    <Button className="w-full" size="lg">
                      {auth.isAuthenticated ? uiCfg.cartProceedAuthLabel : uiCfg.cartProceedGuestLabel}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleClearCart}
                  >
                    {uiCfg.cartClearLabel}
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
