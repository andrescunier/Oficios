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
  WalletCards,
  XCircle,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { orderService } from '@/services/orderService';
import { getBusinessConfig, getUIConfig } from '@/config/runtime';
import { getBusinessPartnerId } from '@/features/auth/session';
import type { LoanResponse, SalesOrder } from '@/services/orderService';

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
  const uiCfg = getUIConfig();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loansByOrder, setLoansByOrder] = useState<Record<string, LoanResponse>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [qualityOkOrderId, setQualityOkOrderId] = useState<string | null>(null);

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
          <h2 className="text-2xl font-bold mb-4">{uiCfg.authRequiredTitle}</h2>
          <p className="text-gray-600 mb-6">{uiCfg.ordersAuthMessage}</p>
          <Link
            to="/login"
            state={{ from: '/pedidos' }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {uiCfg.authLoginButtonLabel}
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
      const loansResponse = await orderService.getLoansByBorrower(businessPartnerId).catch(() => null);
      const nextLoansByOrder: Record<string, LoanResponse> = {};
      loansResponse?.data.forEach((loan) => {
        const metadata = loan.metadata || {};
        const orderId = typeof metadata.sales_order_id === 'string' ? metadata.sales_order_id : '';
        const orderNumber = typeof metadata.sales_order_number === 'string' ? metadata.sales_order_number : '';
        const relatedOrder = response.data.find((order) => order.id === orderId || order.order_number === orderNumber);
        if (relatedOrder) {
          nextLoansByOrder[relatedOrder.id] = loan;
        }
      });
      setLoansByOrder(nextLoansByOrder);
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error al cargar pedidos',
        message: error.message || 'No se pudieron cargar tus pedidos. Intenta nuevamente.',
      });
      setOrders([]);
      setLoansByOrder({});
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

  const getReservationInfo = (order: SalesOrder) => {
    const meta = (order.metadata || {}) as Record<string, unknown>;
    const reservation = (meta.service_reservation || {}) as Record<string, unknown>;
    return {
      providerStatus: String(reservation.provider_status || 'pending_accept'),
      qualityOk: reservation.quality_ok === true,
      barrio: (reservation.barrio || reservation.locality || '') as string,
      serviceDate: (reservation.service_date || '') as string,
      serviceTime: (reservation.service_time || '') as string,
      scheduledAt: (reservation.scheduled_at || '') as string,
    };
  };

  const handleConfirmQualityOk = async (order: SalesOrder) => {
    try {
      setQualityOkOrderId(order.id);
      await orderService.confirmQualityOk(order.id);
      const detail = await orderService.getOrderDetail(order.id);
      setSelectedOrder(detail);
      setOrders((current) => current.map((item) => (item.id === order.id ? { ...item, ...detail } : item)));
      addNotification({
        type: 'success',
        title: 'OK de calidad registrado',
        message: 'Gracias. OficiosHub puede liberar el cobro. Sin contacto directo con la persona.',
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'No se pudo registrar el OK',
        message: error.message || 'El proveedor debe haber aceptado la reserva primero.',
      });
    } finally {
      setQualityOkOrderId(null);
    }
  };

  const getStatusInfo = (status: SalesOrder['status']) => {
    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
      draft: { label: uiCfg.orderStatusDraft, color: 'text-gray-600 bg-gray-100', icon: Clock },
      pending_payment: { label: uiCfg.orderStatusPendingPayment, color: 'text-yellow-600 bg-yellow-100', icon: Clock },
      payment_review: { label: uiCfg.orderStatusPaymentReview, color: 'text-orange-600 bg-orange-100', icon: Clock },
      confirmed: { label: uiCfg.orderStatusConfirmed, color: 'text-blue-600 bg-blue-100', icon: CheckCircle },
      preparing: { label: uiCfg.orderStatusPreparing, color: 'text-indigo-600 bg-indigo-100', icon: Package },
      ready_to_ship: { label: uiCfg.orderStatusReadyToShip, color: 'text-purple-600 bg-purple-100', icon: Package },
      shipped: { label: uiCfg.orderStatusShipped, color: 'text-cyan-600 bg-cyan-100', icon: Truck },
      in_transit: { label: uiCfg.orderStatusInTransit, color: 'text-cyan-600 bg-cyan-100', icon: Truck },
      out_for_delivery: { label: uiCfg.orderStatusOutForDelivery, color: 'text-teal-600 bg-teal-100', icon: Truck },
      delivered: { label: uiCfg.orderStatusDelivered, color: 'text-green-600 bg-green-100', icon: CheckCircle },
      completed: { label: uiCfg.orderStatusCompleted, color: 'text-green-600 bg-green-100', icon: CheckCircle },
      cancelled: { label: uiCfg.orderStatusCancelled, color: 'text-red-600 bg-red-100', icon: XCircle },
      return_requested: { label: uiCfg.orderStatusReturnRequested, color: 'text-amber-600 bg-amber-100', icon: Package },
      return_in_transit: { label: uiCfg.orderStatusReturnInTransit, color: 'text-amber-600 bg-amber-100', icon: Truck },
      returned: { label: uiCfg.orderStatusReturned, color: 'text-orange-600 bg-orange-100', icon: Package },
      refunded: { label: uiCfg.orderStatusRefunded, color: 'text-red-600 bg-red-100', icon: XCircle },
    };

    return statusConfig[status] || {
      label: orderService.getStatusLabel(status),
      color: 'text-gray-600 bg-gray-100',
      icon: Package,
    };
  };

  const getPaymentReviewInfo = (order: SalesOrder) => {
    const validated = { label: uiCfg.paymentReviewValidated, color: 'text-green-700 bg-green-100' };
    const storefrontPaymentStatus = order.storefront_status?.payment?.status;
    if (storefrontPaymentStatus) {
      const paymentConfig: Record<string, { label: string; color: string }> = {
        paid: validated,
        validated,
        partially_paid: { label: uiCfg.paymentReviewInReview, color: 'text-orange-700 bg-orange-100' },
        pending_backend_validation: { label: uiCfg.paymentReviewPendingValidation, color: 'text-yellow-700 bg-yellow-100' },
        rejected: { label: uiCfg.paymentReviewCancelled, color: 'text-red-700 bg-red-100' },
        cancelled: { label: uiCfg.paymentReviewCancelled, color: 'text-red-700 bg-red-100' },
      };
      if (paymentConfig[storefrontPaymentStatus]) {
        return paymentConfig[storefrontPaymentStatus];
      }
    }

    const statusConfig: Record<string, { label: string; color: string }> = {
      draft: { label: uiCfg.paymentReviewPendingSubmit, color: 'text-gray-700 bg-gray-100' },
      pending_payment: { label: uiCfg.paymentReviewPendingValidation, color: 'text-yellow-700 bg-yellow-100' },
      payment_review: { label: uiCfg.paymentReviewInReview, color: 'text-orange-700 bg-orange-100' },
      confirmed: validated,
      preparing: validated,
      ready_to_ship: validated,
      shipped: validated,
      in_transit: validated,
      out_for_delivery: validated,
      delivered: validated,
      completed: validated,
      cancelled: { label: uiCfg.paymentReviewCancelled, color: 'text-red-700 bg-red-100' },
      return_requested: { label: uiCfg.paymentReviewInReturn, color: 'text-amber-700 bg-amber-100' },
      return_in_transit: { label: uiCfg.paymentReviewInReturn, color: 'text-amber-700 bg-amber-100' },
      returned: { label: uiCfg.paymentReviewReturned, color: 'text-amber-700 bg-amber-100' },
      refunded: { label: uiCfg.paymentReviewRefunded, color: 'text-red-700 bg-red-100' },
    };

    return statusConfig[order.status] || { label: uiCfg.paymentMethodPending, color: 'text-gray-700 bg-gray-100' };
  };

  const getPaymentMethodLabel = (method?: string) => {
    const methodMap: Record<string, string> = {
      cash: uiCfg.paymentMethodCash,
      transfer: uiCfg.paymentMethodTransfer,
      credit_card: uiCfg.paymentMethodCreditCard,
      debit_card: uiCfg.paymentMethodDebitCard,
      mercadopago: uiCfg.paymentMethodMercadopago,
      prestamo: uiCfg.paymentMethodLoan,
      stripe: uiCfg.paymentMethodCard,
      card: uiCfg.paymentMethodCard,
      check: uiCfg.paymentMethodCheck,
      other: uiCfg.paymentMethodOther,
    };

    return methodMap[method || 'other'] || method || uiCfg.paymentMethodOther;
  };

  const getLoanStatusInfo = (loan?: LoanResponse | null) => {
    const status = loan?.status || 'pending';
    const statusConfig: Record<string, { label: string; color: string }> = {
      active: { label: uiCfg.loanStatusActive, color: 'text-blue-700 bg-blue-100' },
      paid: { label: uiCfg.loanStatusPaid, color: 'text-green-700 bg-green-100' },
      pending: { label: uiCfg.loanStatusPending, color: 'text-yellow-700 bg-yellow-100' },
      cancelled: { label: uiCfg.loanStatusCancelled, color: 'text-red-700 bg-red-100' },
    };
    return statusConfig[status] || { label: status, color: 'text-gray-700 bg-gray-100' };
  };

  const getLoanPaidAmount = (loan?: LoanResponse | null): number => {
    if (!loan) return 0;
    return Math.max(loan.principal_amount - loan.outstanding_balance, 0);
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
                {uiCfg.ordersBackToProfileLabel}
              </Link>
              <h1 className="text-2xl font-bold">{uiCfg.ordersPageTitle}</h1>
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
                  placeholder={uiCfg.ordersSearchPlaceholder}
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
                  <option value="all">{uiCfg.ordersFilterAllLabel}</option>
                  <option value="pending">{uiCfg.ordersFilterPendingLabel}</option>
                  <option value="processing">{uiCfg.ordersFilterProcessingLabel}</option>
                  <option value="shipped">{uiCfg.ordersFilterShippedLabel}</option>
                  <option value="delivered">{uiCfg.ordersFilterDeliveredLabel}</option>
                  <option value="cancelled">{uiCfg.ordersFilterCancelledLabel}</option>
                  <option value="returned">{uiCfg.ordersFilterReturnedLabel}</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{uiCfg.ordersLoadingMessage}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {orders.length === 0 ? uiCfg.ordersEmptyTitle : uiCfg.ordersEmptyFilterTitle}
            </h3>
            <p className="text-gray-600 mb-6">
              {orders.length === 0
                ? uiCfg.ordersEmptyBody
                : uiCfg.ordersEmptyFilterBody}
            </p>
            {orders.length === 0 && (
              <Link
                to="/productos"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {uiCfg.ordersEmptyExploreLabel}
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              const paymentReview = getPaymentReviewInfo(order);
              const relatedLoan = loansByOrder[order.id];
              const loanStatus = getLoanStatusInfo(relatedLoan);
              const isLoanOrder = order.metadata?.payment_method === 'prestamo';

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
                        <p className="text-sm text-gray-600">{order.items.length} {uiCfg.ordersItemsCountLabel}</p>
                      </div>
                      <button
                        onClick={() => void openOrderDetail(order.id)}
                        className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {uiCfg.ordersViewDetailLabel}
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
                              {uiCfg.ordersCancellingLabel}
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              {uiCfg.ordersCancelLabel}
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
                              <strong>{uiCfg.ordersTrackingLabel}:</strong> {order.metadata.tracking_number}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center text-gray-700 mb-3">
                        <CreditCard className="w-4 h-4 mr-2" />
                        <span className="font-medium">{uiCfg.ordersPaymentInformedLabel}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-gray-900">
                          {getPaymentMethodLabel(order.metadata?.payment_method)}
                        </p>
                        <p className="text-gray-600">
                          {uiCfg.ordersPaymentInfoBody}
                        </p>
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${paymentReview.color}`}>
                          {paymentReview.label}
                        </span>
                        {isLoanOrder && (
                          <div className="mt-3 border-t border-gray-200 pt-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center text-gray-700">
                                <WalletCards className="w-4 h-4 mr-2" />
                                <span className="font-medium">{uiCfg.ordersDetailLoanStatusLabel}</span>
                              </div>
                              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${loanStatus.color}`}>
                                {loanStatus.label}
                              </span>
                            </div>
                            {relatedLoan ? (
                              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                                <span>{uiCfg.ordersDetailLoanPaidLabel}: {formatPrice(getLoanPaidAmount(relatedLoan), relatedLoan.currency)}</span>
                                <span>{uiCfg.ordersDetailLoanOutstandingLabel}: {formatPrice(relatedLoan.outstanding_balance, relatedLoan.currency)}</span>
                              </div>
                            ) : (
                              <p className="mt-2 text-xs text-gray-500">{uiCfg.loanStatusPending}</p>
                            )}
                          </div>
                        )}
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white sm:rounded-lg">
            <div className="shrink-0 border-b bg-white p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{uiCfg.ordersDetailTitle}</h2>
                  <p className="text-sm text-gray-500">{selectedOrder.order_number}</p>
                </div>
                <button type="button" onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar">
                  ✕
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {isDetailLoading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando detalle del pedido...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{uiCfg.ordersDetailStatusLabel}</label>
                      <div
                        className={`inline-flex items-center px-3 py-1 mt-1 rounded-full text-sm font-medium ${getStatusInfo(selectedOrder.status).color}`}
                      >
                        {getStatusInfo(selectedOrder.status).label}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{uiCfg.ordersDetailDateLabel}</label>
                      <p className="text-gray-900 mt-1">{formatDate(selectedOrder.created_at)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{uiCfg.ordersDetailTotalLabel}</label>
                      <p className="text-gray-900 mt-1 font-semibold">
                        {formatPrice(selectedOrder.total_amount, selectedOrder.currency)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{uiCfg.ordersDetailChannelLabel}</label>
                      <p className="text-gray-900 mt-1">{selectedOrder.metadata?.channel || uiCfg.ordersDetailNoChannelLabel}</p>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{uiCfg.ordersDetailNotesLabel}</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                    </div>
                  )}

                  {(() => {
                    const reservation = getReservationInfo(selectedOrder);
                    const providerLabel =
                      reservation.providerStatus === 'accepted'
                        ? 'Proveedor aceptó'
                        : reservation.providerStatus === 'rejected'
                          ? 'Proveedor rechazó'
                          : 'Esperando aceptación del proveedor';
                    return (
                      <div className="mb-6 p-4 border border-blue-100 bg-blue-50/60 rounded-lg space-y-2">
                        <p className="font-medium text-gray-900">Reserva del servicio</p>
                        <p className="text-sm text-gray-700">{providerLabel}</p>
                        {(reservation.barrio || reservation.serviceDate || reservation.serviceTime) && (
                          <p className="text-sm text-gray-700">
                            {[reservation.barrio, reservation.serviceDate, reservation.serviceTime]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Toda la comunicación pasa por OficiosHub. El cobro se libera con tu OK de calidad.
                        </p>
                        {reservation.qualityOk ? (
                          <p className="text-sm font-medium text-green-700">OK de calidad ya registrado</p>
                        ) : reservation.providerStatus === 'accepted' ? (
                          <button
                            type="button"
                            disabled={qualityOkOrderId === selectedOrder.id}
                            onClick={() => handleConfirmQualityOk(selectedOrder)}
                            className="mt-2 inline-flex items-center px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-60"
                          >
                            {qualityOkOrderId === selectedOrder.id ? 'Registrando…' : 'Dar OK de calidad'}
                          </button>
                        ) : null}
                      </div>
                    );
                  })()}

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{uiCfg.ordersDetailProductsLabel}</label>
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
                            <p className="text-sm text-gray-600">{uiCfg.ordersDetailQuantityLabel}: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatPrice(item.unit_price * item.quantity, selectedOrder.currency)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatPrice(item.unit_price, selectedOrder.currency)} {uiCfg.ordersDetailEachLabel}
                            </p>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{uiCfg.ordersDetailPaymentStatusLabel}</label>
                      <div className="space-y-3">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <p className="font-medium text-gray-900">
                              {getPaymentMethodLabel(selectedOrder.storefront_status?.payment?.method || selectedOrder.metadata?.payment_method)}
                            </p>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentReviewInfo(selectedOrder).color}`}
                            >
                              {getPaymentReviewInfo(selectedOrder).label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {uiCfg.ordersDetailStorefrontNote}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{uiCfg.ordersDetailStatusHistoryLabel}</label>
                      <div className="space-y-3">
                        {(selectedOrder.status_history || []).length === 0 ? (
                          <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
                            {uiCfg.ordersDetailNoHistoryMessage}
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

                  {selectedOrder.metadata?.payment_method === 'prestamo' && (
                    <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
                      {(() => {
                        const loan = selectedOrder.related_loan;
                        const loanStatus = getLoanStatusInfo(loan);
                        const paidAmount = getLoanPaidAmount(loan);
                        return (
                          <>
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center text-blue-950">
                                <WalletCards className="mr-2 h-5 w-5" />
                                <div>
                                  <p className="text-sm font-semibold">{uiCfg.ordersDetailLoanStatusLabel}</p>
                                  <p className="text-xs text-blue-700">{loan?.loan_number || uiCfg.loanStatusPending}</p>
                                </div>
                              </div>
                              <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${loanStatus.color}`}>
                                {loanStatus.label}
                              </span>
                            </div>

                            {loan ? (
                              <>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                  <div className="rounded-md bg-white p-3">
                                    <p className="text-xs text-gray-500">{uiCfg.ordersDetailLoanPrincipalLabel}</p>
                                    <p className="text-sm font-semibold text-gray-900">{formatPrice(loan.principal_amount, loan.currency)}</p>
                                  </div>
                                  <div className="rounded-md bg-white p-3">
                                    <p className="text-xs text-gray-500">{uiCfg.ordersDetailLoanPaidLabel}</p>
                                    <p className="text-sm font-semibold text-green-700">{formatPrice(paidAmount, loan.currency)}</p>
                                  </div>
                                  <div className="rounded-md bg-white p-3">
                                    <p className="text-xs text-gray-500">{uiCfg.ordersDetailLoanOutstandingLabel}</p>
                                    <p className="text-sm font-semibold text-blue-800">{formatPrice(loan.outstanding_balance, loan.currency)}</p>
                                  </div>
                                  <div className="rounded-md bg-white p-3">
                                    <p className="text-xs text-gray-500">{uiCfg.ordersDetailLoanDueDateLabel}</p>
                                    <p className="text-sm font-semibold text-gray-900">{formatDate(loan.due_at)}</p>
                                  </div>
                                </div>

                                <div className="mt-4">
                                  <p className="mb-2 text-sm font-semibold text-blue-950">{uiCfg.ordersDetailLoanPaymentsTitle}</p>
                                  {(selectedOrder.related_loan_payments || []).length === 0 ? (
                                    <div className="rounded-md bg-white p-3 text-sm text-gray-500">
                                      {uiCfg.ordersDetailLoanNoPaymentsMessage}
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {selectedOrder.related_loan_payments?.map((payment) => (
                                        <div key={payment.id} className="flex flex-col justify-between gap-1 rounded-md bg-white p-3 text-sm sm:flex-row sm:items-center">
                                          <div>
                                            <p className="font-medium text-gray-900">{formatPrice(payment.amount, loan.currency)}</p>
                                            <p className="text-xs text-gray-500">{formatDate(payment.paid_at)}</p>
                                          </div>
                                          <p className="text-xs text-gray-600">
                                            {uiCfg.ordersDetailLoanOutstandingLabel}: {formatPrice(payment.balance_after, loan.currency)}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </>
                            ) : (
                              <div className="rounded-md bg-white p-3 text-sm text-gray-500">
                                {uiCfg.loanStatusPending}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {(selectedOrder.storefront_status?.delivery?.tracking_reference || selectedOrder.metadata?.tracking_number) && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                      <div className="flex items-center">
                        <Truck className="w-5 h-5 text-blue-600 mr-2" />
                        <div>
                          <p className="font-medium text-blue-800">Información de envío</p>
                          <p className="text-sm text-blue-600">
                            Seguimiento: <strong>{selectedOrder.storefront_status?.delivery?.tracking_reference || selectedOrder.metadata?.tracking_number}</strong>
                          </p>
                          {(selectedOrder.storefront_status?.delivery?.carrier_name || selectedOrder.metadata?.carrier) && (
                            <p className="text-sm text-blue-600">
                              Transportista: {selectedOrder.storefront_status?.delivery?.carrier_name || selectedOrder.metadata?.carrier}
                            </p>
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
                            placeholder="Ej: Ya no necesito el servicio"
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
