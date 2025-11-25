/**
 * Página de pedidos del usuario
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Calendar, 
  DollarSign, 
  Eye,
  ArrowLeft,
  Lock,
  Search,
  Filter,
  ChevronDown,
  Truck,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { orderService } from '@/services/orderService';
import type { SalesOrder } from '@/services/orderService';

export const OrdersPage: React.FC = () => {
  const { auth, addNotification } = useStore();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);

  // Redirigir si no está autenticado
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

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      if (!auth.user?.id) {
        throw new Error('Usuario no identificado');
      }

      const response = await orderService.getUserOrders(auth.user.id, {
        per_page: 50 // Cargar hasta 50 pedidos
      });
      
      setOrders(response.data);
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error al cargar pedidos',
        message: error.message || 'No se pudieron cargar tus pedidos. Intenta nuevamente.',
      });
      
      // En caso de error, mostrar array vacío
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: SalesOrder['status']) => {
    // Mapear el estado de la API al estado del frontend
    const frontendStatus = orderService.mapOrderStatus(status);
    
    switch (frontendStatus) {
      case 'pending':
        return {
          label: 'Pendiente',
          color: 'text-yellow-600 bg-yellow-100',
          icon: Clock
        };
      case 'processing':
        return {
          label: 'Procesando',
          color: 'text-blue-600 bg-blue-100',
          icon: Package
        };
      case 'shipped':
        return {
          label: 'Enviado',
          color: 'text-purple-600 bg-purple-100',
          icon: Truck
        };
      case 'delivered':
        return {
          label: 'Entregado',
          color: 'text-green-600 bg-green-100',
          icon: CheckCircle
        };
      case 'cancelled':
        return {
          label: 'Cancelado',
          color: 'text-red-600 bg-red-100',
          icon: XCircle
        };
      default:
        return {
          label: 'Desconocido',
          color: 'text-gray-600 bg-gray-100',
          icon: Package
        };
    }
  };

  const formatPrice = (price: number, currency?: string) => {
    if (typeof price !== 'number' || isNaN(price)) {
      return 'Precio no disponible';
    }
    const currencyCode = currency || 'USD';
    
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || orderService.mapOrderStatus(order.status) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/perfil" 
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Perfil
              </Link>
              <h1 className="text-2xl font-bold">Mis Pedidos</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por número de pedido o producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="processing">Procesando</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Lista de pedidos */}
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
                : 'Intenta ajustar los filtros de búsqueda.'
              }
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
              
              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                      <div>
                        <h3 className="font-semibold text-lg">{order.order_number}</h3>
                        <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                      </div>
                      <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {statusInfo.label}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-semibold">{formatPrice(order.total_amount, order.currency)}</p>
                        <p className="text-sm text-gray-600">{order.items.length} producto(s)</p>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                  
                  {/* Productos del pedido */}
                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">
                            {item.quantity}x {item.description}
                          </span>
                          <span className="font-medium">{formatPrice(item.unit_price * item.quantity, order.currency)}</span>
                        </div>
                      ))}
                    </div>
                    
                    {order.metadata?.tracking_number && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center">
                          <Truck className="w-4 h-4 text-blue-600 mr-2" />
                          <span className="text-sm text-blue-800">
                            <strong>Número de seguimiento:</strong> {order.metadata.tracking_number}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de detalles del pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Detalles del Pedido</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Número de Pedido</label>
                  <p className="text-gray-900">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(selectedOrder.status).color}`}>
                    {getStatusInfo(selectedOrder.status).label}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Pedido</label>
                  <p className="text-gray-900">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total</label>
                  <p className="text-gray-900 font-semibold">{formatPrice(selectedOrder.total_amount, selectedOrder.currency)}</p>
                </div>
              </div>
              
              {selectedOrder.notes && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de Envío</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Productos</label>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(item.unit_price * item.quantity, selectedOrder.currency)}</p>
                        <p className="text-sm text-gray-600">{formatPrice(item.unit_price, selectedOrder.currency)} c/u</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedOrder.metadata?.tracking_number && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <Truck className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <p className="font-medium text-blue-800">Información de Envío</p>
                      <p className="text-sm text-blue-600">
                        Número de seguimiento: <strong>{selectedOrder.metadata.tracking_number}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};