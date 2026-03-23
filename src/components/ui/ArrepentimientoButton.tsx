/**
 * Botón de Arrepentimiento (Derecho del consumidor)
 */

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { CONTACT } from '@/config/branding';

export const ArrepentimientoButton: React.FC = () => {
  const message = encodeURIComponent('Me arrepiento de mi compra y deseo ejercer mi derecho de arrepentimiento.');
  const whatsappUrl = `${CONTACT.WHATSAPP_LINK}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
      aria-label="Botón de Arrepentimiento"
    >
      <RotateCcw className="w-6 h-6" />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Botón de Arrepentimiento
      </span>
    </a>
  );
};

export default ArrepentimientoButton;
