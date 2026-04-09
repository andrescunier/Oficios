/**
 * Página de pedidos del usuario
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  CreditCard,
  Eye,
  Filter,
  Lock,
  Package,
  Search,
  Truck,
  XCircle,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { orderService } from '@/services/orderService';
import { getBusinessConfig } from '@/config/runtime';
import { getBusinessPartnerId } from '@/features/auth/session';
import type { SalesOrder } from '@/services/orderService';

/** Resolve SKU from item.sku or order metadata fallback */
function getItemSku(order: SalesOrder, item: SalesOrder['items'][number], index: number): string | undefined {
  if (item.sku) return item.sku;
  const variantInfo = (order.metadata as any)?.line_items_variant_info;
  if (Array.isArray(variantInfo)) {
    const match = variantInfo.find((vi: any) => vi.product_id === item.product_id) ?? variantInfo[index];
    return match?.variant_sku || match?.product_sku;
  }
  return undefined;
}

export const OrdersPage: React.FC = () => {
  const { auth, addNotification } = useStore();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  useEffect(() => {
    if (auth.isAuthenticated) {
      void loadOrders();
    }
  }, [auth.isAuthenticated]);

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Acceso Requerido</h2>
          <p className="text-gray-600 mb-6">Necesitas iniciar sesión para ver tus pedidos</p>
          <Link
            to="/login"
            state={{ from: '/pedidos' }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const businessPartnerId = getBusinessPartnerId();

      if (!businessPartnerId) {
        throw new Error('No se encontró tu información de cliente. Intenta cerrar sesión y volver a entrar.');
      }

      const response = await orderService.getUserOrders(businessPartnerId, {
        per_page: getBusinessConfig().productsPerPage,
      });

      setOrders(response.data);
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error al cargar pedidos',
        message: error.message || 'No se pudieron cargar tus pedidos. Intenta nuevamente.',
      });
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openOrderDetail = async (orderId: string) => {
    setIsDetailLoading(true);
    try {
      const detail = await orderService.getOrderDetail(orderId);
      setSelectedOrder(detail);
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'No se pudo cargar el detalle',
        message: error.message || 'Intenta nuevamente.',
      });
    } finally {
      setIsDetailLoading(false);
    }
  };

  const getStatusInfo = (status: SalesOrder['status']) => {
    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
      draft: { label: 'Borrador', color: 'text-gray-600 bg-gray-100', icon: Clock },
      pending_payment: { label: 'Pago pendiente', color: 'text-yellow-600 bg-yellow-100', icon: Clock },
      payment_review: { label: 'Revisión de pago', color: 'text-orange-600 bg-orange-100', icon: Clock },
      confirmed: { label: 'Confirmado', color: 'text-blue-600 bg-blue-100', icon: CheckCircle },
      preparing: { label: 'En preparación', color: 'text-indigo-600 bg-indigo-100', icon: Package },
      ready_to_ship: { label: 'Listo para enviar', color: 'text-purple-600 bg-purple-100', icon: Package },
      shipped: { label: 'Enviado', color: 'text-cyan-600 bg-cyan-100', icon: Truck },
      in_transit: { label: 'En tránsito', color: 'text-cyan-600 bg-cyan-100', icon: Truck },
      out_for_delivery: { label: 'En reparto', color: 'text-teal-600 bg-teal-100', icon: Truck },
      delivered: { label: 'Entregado', color: 'text-green-600 bg-green-100', icon: CheckCircle },
      completed: { label: 'Completado', color: 'text-green-600 bg-green-100', icon: CheckCircle },
      cancelled: { label: 'Cancelado', color: 'text-red-600 bg-red-100', icon: XCircle },
      return_requested: { label: 'Devolución solicitada', color: 'text-amber-600 bg-amber-100', icon: Package },
      return_in_transit: { label: 'Dev. en tránsito', color: 'text-amber-600 bg-amber-100', icon: Truck },
      returned: { label: 'Devuelto', color: 'text-orange-600 bg-orange-100', icon: Package },
      refunded: { label: 'Reembolsado', color: 'text-red-600 bg-red-100', icon: XCircle },
    };

    return statusConfig[status] || {
      label: orderService.getStatusLabel(status),
      color: 'text-gray-600 bg-gray-100',
      icon: Package,
    };
  };

  const getPaymentReviewInfo = (order: SalesOrder) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      draft: { label: 'Pendiente de envio', color: 'text-gray-700 bg-gray-100' },
      pending_payment: { label: 'Pendiente de validacion', color: 'text-yellow-700 bg-yellow-100' },
      payment_review: { label: 'En revision backend', color: 'text-orange-700 bg-orange-100' },
      confirmed: { label: 'Validado por backend', color: 'text-green-700 bg-green-100' },
      preparing: { label: 'Validado por backend', color: 'text-green-700 bg-green-100' },
      ready_to_ship: { label: 'Validado por backend', color: 'text-green-700 bg-green-100' },
      shipped: { label: 'Validado por backend', color: 'text-green-700 bg-green-100' },
      in_transit: { label: 'Validado por backend', color: 'text-green-700 bg-green-100' },
      out_for_delivery: { label: 'Validado por backend', color: 'text-green-700 bg-green-100' },
      delivered: { label: 'Validado por backend', color: 'text-green-700 bg-green-100' },
      completed: { label: 'Validado por backend', color: 'text-green-700 bg-green-100' },
      cancelled: { label: 'Cancelado', color: 'text-red-700 bg-red-100' },
      return_requested: { label: 'En devolucion', color: 'text-amber-700 bg-amber-100' },
      return_in_transit: { label: 'En devolucion', color: 'text-amber-700 bg-amber-100' },
      returned: { label: 'Devuelto', color: 'text-amber-700 bg-amber-100' },
      refunded: { label: 'Reembolsado', color: 'text-red-700 bg-red-100' },
    };

    return statusConfig[order.status] || { label: 'Pendiente', color: 'text-gray-700 bg-gray-100' };
  };

  const getPaymentMethodLabel = (method?: string) => {
    const methodMap: Record<string, string> = {
      cash: 'Efectivo',
      transfer: 'Transferencia',
      credit_card: 'Tarjeta crédito',
      debit_card: 'Tarjeta débito',
      mercadopago: 'Mercado Pago',
      stripe: 'Stripe',
      card: 'Tarjeta',
      check: 'Cheque',
      other: 'Otro',
    };

    return methodMap[method || 'other'] || method || 'Otro';
  };

  const formatPrice = (price: number, currency?: string) => {
    if (typeof price !== 'number' || Number.isNaN(price)) {
      return 'Precio no disponible';
    }

    const business = getBusinessConfig();
    const currencyCode = currency || business.defaultCurrency;

    return new Intl.NumberFormat(business.locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) {
      return 'Sin fecha';
    }

    const business = getBusinessConfig();
    return new Date(dateString).toLocaleDateString(business.locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canCancelOrder = (status: string): boolean => orderService.canCancelOrder(status);

  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrderId(orderId);
    try {
      const result = await orderService.cancelOrder(orderId, cancelReason || 'Cancelado por el cliente');

      if (!result.success) {
        throw new Error(result.message || 'Error al cancelar el pedido');
      }

      addNotification({
        type: 'success',
        title: 'Pedido cancelado',
        message: 'Tu pedido ha sido cancelado exitosamente.',
      });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: 'cancelled',
                status_history: [
                  ...(order.status_history || []),
                  {
                    id: `local-cancel-${orderId}`,
                    from_status: order.status,
                    to_status: 'cancelled',
                    reason: cancelReason || 'Cancelado por el cliente',
                    event_id: null,
                    user_id: auth.user?.id || null,
                    metadata: {},
                    created_at: new Date().toISOString(),
                  },
                ],
              }
            : order
        )
      );

      setSelectedOrder((current) =>
        current?.id === orderId
          ? {
              ...current,
              status: 'cancelled',
              status_history: [
                ...(current.status_history || []),
                {
                  id: `local-cancel-${orderId}`,
                  from_status: current.status,
                  to_status: 'cancelled',
                  reason: cancelReason || 'Cancelado por el cliente',
                  event_id: null,
                  user_id: auth.user?.id || null,
                  metadata: {},
                  created_at: new Date().toISOString(),
                },
              ],
            }
          : current
      );
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error al cancelar',
        message: error.message || 'No se pudo cancelar el pedido. Intenta nuevamente.',
      });
    } finally {
      setCancellingOrderId(null);
      setCancelReason('');
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) => item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || orderService.mapOrderStatus(order.status) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/perfil" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Perfil
              </Link>
              <h1 className="text-2xl font-bold">Mis Pedidos</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por número de pedido o producto..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg pl-10 pr-8 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="processing">Procesando</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                  <option value="returned">Devolución</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tus pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {orders.length === 0 ? 'No tienes pedidos aún' : 'No se encontraron pedidos'}
            </h3>
            <p className="text-gray-600 mb-6">
              {orders.length === 0
                ? 'Cuando realices tu primera compra, aparecerá aquí.'
                : 'Intenta ajustar los filtros de búsqueda.'}
            </p>
            {orders.length === 0 && (
              <Link
                to="/productos"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explorar Productos
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              const paymentReview = getPaymentReviewInfo(order);

              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold text-lg">{order.order_number}</h3>
                        <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                      </div>
                      <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {statusInfo.label}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-semibold">{formatPrice(order.total_amount, order.currency)}</p>
                        <p className="text-sm text-gray-600">{order.items.length} producto(s)</p>
                      </div>
                      <button
                        onClick={() => void openOrderDetail(order.id)}
                        className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalles
                      </button>
                      {canCancelOrder(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingOrderId === order.id}
                          className="flex items-center px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {cancellingOrderId === order.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-2"></div>
                              Cancelando...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancelar
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[2fr,1fr] border-t pt-4">
                    <div className="space-y-2">
                      {order.items.map((item, index) => {
                        const sku = getItemSku(order, item, index);
                        return (
                        <div key={`${order.id}-${index}`} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">
                            {item.quantity}x {item.description}
                            {sku && <span className="text-gray-400 ml-1">({sku})</span>}
                          </span>
                          <span className="font-medium">
                            {formatPrice(item.unit_price * item.quantity, order.currency)}
                          </span>
                        </div>
                        );
                      })}

                      {order.metadata?.tracking_number && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center">
                            <Truck className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="text-sm text-blue-800">
                              <strong>Seguimiento:</strong> {order.metadata.tracking_number}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center text-gray-700 mb-3">
                        <CreditCard className="w-4 h-4 mr-2" />
                        <span className="font-medium">Pago informado</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-gray-900">
                          {getPaymentMethodLabel(order.metadata?.payment_method)}
                        </p>
                        <p className="text-gray-600">
                          El storefront solo informa el medio de pago. La validación queda del lado backend.
                        </p>
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${paymentReview.color}`}>
                          {paymentReview.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Detalles del Pedido</h2>
                  <p className="text-sm text-gray-500">{selectedOrder.order_number}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {isDetailLoading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando detalle del pedido...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estado</label>
                      <div
                        className={`inline-flex items-center px-3 py-1 mt-1 rounded-full text-sm font-medium ${getStatusInfo(selectedOrder.status).color}`}
                      >
                        {getStatusInfo(selectedOrder.status).label}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha</label>
                      <p className="text-gray-900 mt-1">{formatDate(selectedOrder.created_at)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total</label>
                      <p className="text-gray-900 mt-1 font-semibold">
                        {formatPrice(selectedOrder.total_amount, selectedOrder.currency)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Canal</label>
                      <p className="text-gray-900 mt-1">{selectedOrder.metadata?.channel || 'Sin definir'}</p>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notas / entrega</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                    </div>
                  )}

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Productos</label>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => {
                        const sku = getItemSku(selectedOrder, item, index);
                        return (
                        <div
                          key={`${selectedOrder.id}-detail-${index}`}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{item.description}</p>
                            {sku && <p className="text-xs text-gray-400">SKU: {sku}</p>}
                            <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatPrice(item.unit_price * item.quantity, selectedOrder.currency)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatPrice(item.unit_price, selectedOrder.currency)} c/u
                            </p>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estado de pago</label>
                      <div className="space-y-3">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <p className="font-medium text-gray-900">
                              {getPaymentMethodLabel(selectedOrder.metadata?.payment_method)}
                            </p>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentReviewInfo(selectedOrder).color}`}
                            >
                              {getPaymentReviewInfo(selectedOrder).label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            El frontend informó el medio de pago y el backend controla la validación.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Historial de estados</label>
                      <div className="space-y-3">
                        {(selectedOrder.status_history || []).length === 0 ? (
                          <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
                            No hay historial detallado disponible para este pedido.
                          </div>
                        ) : (
                          selectedOrder.status_history?.map((entry) => (
                            <div key={entry.id} className="p-4 border rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-900">
                                  {orderService.getStatusLabel(entry.to_status)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">{formatDate(entry.created_at)}</p>
                              {entry.reason && <p className="text-sm text-gray-700 mt-1">{entry.reason}</p>}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedOrder.metadata?.tracking_number && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                      <div className="flex items-center">
                        <Truck className="w-5 h-5 text-blue-600 mr-2" />
                        <div>
                          <p className="font-medium text-blue-800">Información de envío</p>
                          <p className="text-sm text-blue-600">
                            Seguimiento: <strong>{selectedOrder.metadata.tracking_number}</strong>
                          </p>
                          {selectedOrder.metadata?.carrier && (
                            <p className="text-sm text-blue-600">Transportista: {selectedOrder.metadata.carrier}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {canCancelOrder(selectedOrder.status) && (
                    <div className="pt-6 border-t">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-800 mb-2">¿Cancelar este pedido?</h4>
                        <p className="text-sm text-red-600 mb-4">
                          Esta acción no se puede deshacer. El pedido será cancelado permanentemente.
                        </p>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-red-700 mb-1">
                            Motivo de cancelación
                          </label>
                          <input
                            type="text"
                            value={cancelReason}
                            onChange={(event) => setCancelReason(event.target.value)}
                            placeholder="Ej: Ya no necesito el producto"
                            className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                        <button
                          onClick={() => handleCancelOrder(selectedOrder.id)}
                          disabled={cancellingOrderId === selectedOrder.id}
                          className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          {cancellingOrderId === selectedOrder.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Cancelando...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Confirmar cancelación
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
