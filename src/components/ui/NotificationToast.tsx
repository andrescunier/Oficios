/**
 * Componente de notificaciones toast
 * Muestra notificaciones del store como toasts flotantes
 */

import React, { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { CheckCircle, XCircle, AlertTriangle, Info, X, ShoppingCart } from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: {
    bg: 'bg-green-50 border-green-200',
    icon: 'text-green-500',
    title: 'text-green-800',
    message: 'text-green-700',
    progress: 'bg-green-400',
    close: 'text-green-400 hover:text-green-600',
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    icon: 'text-red-500',
    title: 'text-red-800',
    message: 'text-red-700',
    progress: 'bg-red-400',
    close: 'text-red-400 hover:text-red-600',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-500',
    title: 'text-amber-800',
    message: 'text-amber-700',
    progress: 'bg-amber-400',
    close: 'text-amber-400 hover:text-amber-600',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-500',
    title: 'text-blue-800',
    message: 'text-blue-700',
    progress: 'bg-blue-400',
    close: 'text-blue-400 hover:text-blue-600',
  },
};

interface ToastItemProps {
  notification: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
  };
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ notification, onDismiss }) => {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const duration = notification.duration || 4000;
  const colors = colorMap[notification.type];
  const Icon = notification.title.toLowerCase().includes('carrito') || notification.title.toLowerCase().includes('agregado')
    ? ShoppingCart
    : iconMap[notification.type];

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onDismiss(notification.id);
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [notification.id, duration, onDismiss]);

  return (
    <div
      className={`
        relative flex items-start gap-3 w-80 p-4 rounded-lg border shadow-lg
        ${colors.bg}
        animate-slide-in-right
        transition-all duration-300 ease-out
      `}
      role="alert"
    >
      {/* Icono */}
      <div className={`flex-shrink-0 mt-0.5 ${colors.icon}`}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${colors.title}`}>
          {notification.title}
        </p>
        <p className={`text-sm mt-0.5 ${colors.message}`}>
          {notification.message}
        </p>
      </div>

      {/* Botón cerrar */}
      <button
        onClick={() => onDismiss(notification.id)}
        className={`flex-shrink-0 ${colors.close} transition-colors`}
      >
        <X className="w-4 h-4" />
      </button>

      {/* Barra de progreso */}
      <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-lg overflow-hidden">
        <div
          className={`h-full ${colors.progress} opacity-60`}
          style={{
            animation: `shrink-width ${duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
};

export const NotificationToast: React.FC = () => {
  const notifications = useStore((state) => state.ui?.notifications || []);
  const removeNotification = useStore((state) => state.removeNotification);

  if (notifications.length === 0) return null;

  return (
    <>
      {/* Estilos de animación inline */}
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes shrink-width {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
      `}</style>

      {/* Contenedor de toasts */}
      <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {notifications.slice(-5).map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <ToastItem
              notification={notification}
              onDismiss={removeNotification}
            />
          </div>
        ))}
      </div>
    </>
  );
};
