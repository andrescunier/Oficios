/**
 * Footer profesional para iAmerican Ecommerce
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  Shield,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export const Footer: React.FC = () => {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para suscripción al newsletter
    console.log('Newsletter subscription');
  };

  const footerSections = {
    company: {
      title: 'Empresa',
      links: [
        { label: 'Sobre Nosotros', href: '/sobre-nosotros' },
        { label: 'Nuestras Tiendas', href: '/tiendas' },
        { label: 'Trabaja con Nosotros', href: '/empleos' },
        { label: 'Prensa', href: '/prensa' },
        { label: 'Inversionistas', href: '/inversionistas' },
      ]
    },
    customer: {
      title: 'Atención al Cliente',
      links: [
        { label: 'Centro de Ayuda', href: '/ayuda' },
        { label: 'Contacto', href: '/contacto' },
        { label: 'Seguimiento de Pedido', href: '/seguimiento' },
        { label: 'Devoluciones', href: '/devoluciones' },
        { label: 'Garantías', href: '/garantias' },
      ]
    },
    categories: {
      title: 'Categorías',
      links: [
        { label: 'Baño', href: '/categoria/bano' },
        { label: 'Cocina', href: '/categoria/cocina' },
        { label: 'Dormitorio', href: '/categoria/dormitorio' },
        { label: 'Sala', href: '/categoria/sala' },
        { label: 'Jardín', href: '/categoria/jardin' },
      ]
    },
    legal: {
      title: 'Legal',
      links: [
        { label: 'Términos y Condiciones', href: '/terminos' },
        { label: 'Política de Privacidad', href: '/privacidad' },
        { label: 'Política de Cookies', href: '/cookies' },
        { label: 'Defensa del Consumidor', href: '/defensa-consumidor' },
        { label: 'Arrepentimiento', href: '/arrepentimiento' },
      ]
    }
  };

  const features = [
    {
      icon: Truck,
      title: 'Envío Gratis',
      description: 'En compras superiores a $50.000'
    },
    {
      icon: RotateCcw,
      title: 'Devolución Gratis',
      description: 'Hasta 30 días para devolver'
    },
    {
      icon: Shield,
      title: 'Compra Segura',
      description: 'Protegemos tus datos'
    },
    {
      icon: CreditCard,
      title: 'Múltiples Pagos',
      description: 'Tarjetas, transferencia y más'
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/iamerican', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com/iamerican', label: 'Instagram' },
    { icon: Twitter, href: 'https://twitter.com/iamerican', label: 'Twitter' },
    { icon: Youtube, href: 'https://youtube.com/iamerican', label: 'YouTube' },
  ];

  return (
    <footer className="bg-muted/50 border-t">
      {/* Features section */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">iA</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                iAmerican
              </span>
            </Link>
            
            <p className="text-sm text-muted-foreground mb-6">
              Tu tienda online de confianza. Ofrecemos productos de calidad para el hogar 
              con la mejor atención al cliente y envíos a todo el país.
            </p>

            {/* Contact info */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>Av. Corrientes 1234, CABA, Argentina</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>+54 11 1234-5678</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>info@iamerican.com</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex space-x-2">
              {socialLinks.map((social, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="icon"
                  asChild
                  className="w-8 h-8"
                >
                  <a 
                    href={social.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Footer sections */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <Link 
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t">
          <div className="max-w-md">
            <h3 className="font-semibold mb-2">Suscríbete a nuestro newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Recibe ofertas exclusivas y novedades directamente en tu email.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex space-x-2">
              <Input
                type="email"
                placeholder="Tu email"
                className="flex-1"
                required
              />
              <Button type="submit">Suscribirse</Button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2024 iAmerican. Todos los derechos reservados.
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Métodos de pago:</span>
              <div className="flex space-x-2">
                {['Visa', 'Mastercard', 'American Express', 'Mercado Pago'].map((payment) => (
                  <div
                    key={payment}
                    className="w-8 h-5 bg-muted rounded border flex items-center justify-center"
                  >
                    <span className="text-xs font-bold text-muted-foreground">
                      {payment.slice(0, 2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
