# iAmerican - Ecommerce Profesional

Un ecommerce moderno y profesional desarrollado con React, TypeScript y las mejores prácticas de desarrollo web.

## 🚀 Características

### ✨ **Funcionalidades Principales**
- 🛍️ **Catálogo de productos** con filtros avanzados
- 🛒 **Carrito de compras** dinámico y persistente
- 🔐 **Autenticación completa** (login/registro)
- 💳 **Proceso de checkout** profesional
- ❤️ **Sistema de favoritos**
- 📱 **Diseño responsive** para todos los dispositivos
- 🎨 **Interfaz moderna** con animaciones suaves

### 🛠️ **Stack Tecnológico**
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 6.3.5
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: Zustand
- **API Client**: Axios + React Query
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

### 🔗 **Integración API**
- **SIGP API**: Integración completa con Simple Gestión API
- **Multi-tenant**: Soporte para múltiples cuentas
- **HTTPS**: Configurado para tráfico seguro
- **Variables de entorno**: Configuración flexible

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- pnpm (recomendado) o npm

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd iamerican-react-pro
```

2. **Instalar dependencias**
```bash
pnpm install
# o
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus configuraciones:
```env
VITE_API_BASE_URL=https://tu-api.com
VITE_ACCOUNT_ID=tu-account-id
VITE_APP_ENV=production
```

4. **Iniciar en desarrollo**
```bash
pnpm dev
# o
npm run dev
```

5. **Build para producción**
```bash
pnpm build
# o
npm run build
```

## 🌐 Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `VITE_API_BASE_URL` | URL base de la API SIGP | ✅ |
| `VITE_ACCOUNT_ID` | ID de la cuenta (multi-tenant) | ✅ |
| `VITE_APP_ENV` | Entorno de la aplicación | ❌ |
| `VITE_ENABLE_API_LOGGING` | Habilitar logs de API | ❌ |

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── layout/         # Header, Footer, etc.
│   ├── product/        # Componentes de productos
│   ├── cart/           # Componentes del carrito
│   └── ui/             # Componentes base (shadcn/ui)
├── pages/              # Páginas principales
│   ├── Home.tsx        # Página principal
│   ├── Login.tsx       # Inicio de sesión
│   └── Register.tsx    # Registro
├── services/           # Servicios API
│   ├── httpClient.ts   # Cliente HTTP
│   ├── authService.ts  # Autenticación
│   └── productService.ts # Productos
├── store/              # Estado global (Zustand)
├── types/              # Tipos TypeScript
├── config/             # Configuración
└── utils/              # Utilidades
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Servidor de desarrollo
pnpm build            # Build de producción
pnpm preview          # Preview del build
pnpm lint             # Linting con ESLint
pnpm type-check       # Verificación de tipos

# Testing (cuando esté configurado)
pnpm test             # Ejecutar tests
pnpm test:coverage    # Tests con coverage
```

## 🎨 Componentes UI

El proyecto utiliza **shadcn/ui** para componentes base:

- ✅ Button, Input, Label
- ✅ Card, Badge, Alert
- ✅ Dialog, Sheet, Dropdown
- ✅ Form, Checkbox, Select
- ✅ Toast, Tooltip, Separator

## 📱 Responsive Design

- **Mobile First**: Optimizado para móviles
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch Friendly**: Botones y controles optimizados para touch
- **Performance**: Lazy loading y optimizaciones

## 🔐 Autenticación

### Flujo de autenticación
1. **Login/Registro** → Obtener token JWT
2. **Token storage** → LocalStorage seguro
3. **API calls** → Headers automáticos
4. **Auto-refresh** → Renovación de tokens

### Endpoints utilizados
- `POST /api/auth/token` - Obtener token
- `POST /api/accounts/{id}/people` - Crear persona
- `POST /api/accounts/{id}/users` - Crear usuario
- `POST /api/accounts/{id}/business-partners` - Crear cliente

## 🛒 Carrito de Compras

### Características
- ✅ **Persistencia** en localStorage
- ✅ **Validación de stock** en tiempo real
- ✅ **Cálculo automático** de totales
- ✅ **Envío gratis** en compras >$50,000
- ✅ **Drawer lateral** con animaciones

### Estado del carrito
```typescript
interface CartItem {
  product: Product;
  quantity: number;
  addedAt: string;
}
```

## 🎯 APIs Integradas

### Productos
- `GET /api/accounts/{id}/products` - Listar productos
- `GET /api/accounts/{id}/products/{id}` - Detalle producto

### Órdenes
- `POST /api/accounts/{id}/sales-orders` - Crear orden
- `GET /api/accounts/{id}/sales-orders` - Listar órdenes

### Pagos
- `POST /api/accounts/{id}/payments` - Procesar pago
- `GET /api/accounts/{id}/payments` - Historial pagos

## 🚀 Despliegue

### Build de producción
```bash
pnpm build
```

### Archivos generados
- `dist/` - Archivos estáticos optimizados
- `dist/assets/` - CSS, JS y assets minificados
- `dist/index.html` - HTML principal

### Configuración del servidor
- **HTTPS**: Requerido para producción
- **Gzip**: Compresión habilitada
- **Cache**: Headers de cache configurados
- **SPA**: Redirección a index.html para rutas

### Variables de producción
```env
VITE_API_BASE_URL=https://api.iamerican.com
VITE_ACCOUNT_ID=prod-account-id
VITE_APP_ENV=production
VITE_ENABLE_API_LOGGING=false
```

## 📊 Performance

### Optimizaciones implementadas
- ✅ **Code splitting** automático
- ✅ **Lazy loading** de componentes
- ✅ **Tree shaking** para eliminar código no usado
- ✅ **Minificación** de CSS y JS
- ✅ **Compresión** de assets
- ✅ **Preload** de recursos críticos

### Métricas objetivo
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3s

## 🔍 SEO

### Configuración
- ✅ **Meta tags** dinámicos
- ✅ **Open Graph** para redes sociales
- ✅ **Structured data** para productos
- ✅ **Sitemap** automático
- ✅ **Robots.txt** configurado

## 🛡️ Seguridad

### Medidas implementadas
- ✅ **HTTPS** obligatorio
- ✅ **JWT tokens** seguros
- ✅ **Validación** de entrada
- ✅ **Sanitización** de datos
- ✅ **CORS** configurado
- ✅ **CSP** headers

## 📞 Soporte

Para soporte técnico o consultas:
- **Email**: soporte@iamerican.com
- **Documentación**: [docs.iamerican.com](https://docs.iamerican.com)
- **Issues**: GitHub Issues

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

---

**Desarrollado con ❤️ por el equipo de iAmerican**
