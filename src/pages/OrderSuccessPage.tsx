import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, CreditCard, Mail, ArrowRight, ShoppingBag, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getBusinessConfig, getUIConfig } from '@/config/runtime';
import { Separator } from '@/components/ui/separator';
import type { LoanResponse } from '@/services/orderService';

interface OrderSuccessState {
  orderSuccess: boolean;
  orderNumber: string;
  paymentMethod?: string;
  loan?: LoanResponse | null;
  customerEmail: string;
  totalAmount: number;
}

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as OrderSuccessState | null;
  const uiCfg = getUIConfig();

  // Si no hay state válido, redirigir al home
  useEffect(() => {
    if (!state?.orderSuccess) {
      navigate('/', { replace: true });
    }
  }, [state, navigate]);

  // Si no hay datos, mostrar loading mientras redirige
  if (!state?.orderSuccess) {
    return null;
  }

  const formatPrice = (price: number) => {
    const business = getBusinessConfig();
    return new Intl.NumberFormat(business.locale, {
      style: 'currency',
      currency: business.defaultCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPaymentMethodLabel = (method?: string) => {
    const methodMap: Record<string, string> = {
      cash: uiCfg.paymentMethodCash,
      transfer: uiCfg.paymentMethodTransfer,
      transferencia: uiCfg.paymentMethodTransfer,
      credit_card: uiCfg.paymentMethodCreditCard,
      debit_card: uiCfg.paymentMethodDebitCard,
      mercadopago: uiCfg.paymentMethodMercadopago,
      prestamo: uiCfg.paymentMethodLoan,
      stripe: uiCfg.paymentMethodCard,
      card: uiCfg.paymentMethodCard,
      check: uiCfg.paymentMethodCheck,
      other: uiCfg.paymentMethodOther,
    };

    return methodMap[method || 'other'] || method || uiCfg.paymentMethodPending;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Ícono de éxito animado */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-bounce">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {uiCfg.orderSuccessTitle}
          </h1>
          <p className="text-lg text-gray-600">
            {uiCfg.orderSuccessSubtitle}
          </p>
        </div>

        {/* Card con detalles del pedido */}
        <Card className="mb-8 shadow-lg border-green-200">
          <CardContent className="p-6">
            {/* Número de orden */}
            <div className="flex items-center gap-4 py-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">{uiCfg.orderSuccessOrderNumberLabel}</p>
                <p className="text-xl font-bold text-gray-900">{state.orderNumber}</p>
              </div>
            </div>

            <Separator />

            {/* Medio de pago informado */}
            <div className="flex items-center gap-4 py-4">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">{uiCfg.orderSuccessPaymentMethodLabel}</p>
                <p className="text-xl font-bold text-gray-900">{getPaymentMethodLabel(state.paymentMethod)}</p>
                <p className="text-sm text-amber-700">{uiCfg.orderSuccessPaymentPendingLabel}</p>
              </div>
            </div>

            <Separator />

            {state.paymentMethod === 'prestamo' && state.loan && (
              <>
                <div className="flex items-center gap-4 py-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">{uiCfg.ordersDetailLoanNumberLabel}</p>
                    <p className="text-xl font-bold text-gray-900">{state.loan.loan_number}</p>
                    <p className="text-sm text-blue-700">
                      {uiCfg.ordersDetailLoanOutstandingLabel}: {formatPrice(state.loan.outstanding_balance)}
                    </p>
                  </div>
                </div>

                <Separator />
              </>
            )}

            {/* Email de confirmación */}
            <div className="flex items-center gap-4 py-4">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
                <Mail className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">{uiCfg.orderSuccessEmailLabel}</p>
                <p className="text-lg font-semibold text-gray-900">{state.customerEmail}</p>
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex items-center justify-between py-4 bg-gray-50 rounded-lg px-4 mt-4">
              <span className="text-lg text-gray-600">{uiCfg.orderSuccessTotalLabel}</span>
              <span className="text-2xl font-bold text-green-600">
                {formatPrice(state.totalAmount)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Mensaje informativo */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-800">{uiCfg.orderSuccessNextTitle}</h3>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>• {uiCfg.orderSuccessNextBullet1}</li>
                <li>• {uiCfg.orderSuccessNextBullet2}</li>
                <li>• {uiCfg.orderSuccessNextBullet3}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1" size="lg">
            <Link to="/pedidos">
              <FileText className="w-5 h-5 mr-2" />
              {uiCfg.orderSuccessViewOrdersLabel}
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1" size="lg">
            <Link to="/productos">
              <ShoppingBag className="w-5 h-5 mr-2" />
              {uiCfg.orderSuccessContinueLabel}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Link al home */}
        <div className="text-center mt-8">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 underline">
            {uiCfg.orderSuccessBackHomeLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
