# DIAP - Plataforma E-commerce B2B

![DIAP Logo](public/diap-logo.png)

## 🏢 Sobre DIAP

**DIAP** es una distribuidora de productos tecnológicos de primera calidad que ofrece soluciones profesionales para empresas.

### ✨ Características Principales

- 🔐 **Plataforma B2B**: Precios exclusivos para clientes registrados
- 🛒 **E-commerce Completo**: Catálogo de productos tecnológicos
- 📱 **Responsive Design**: Optimizado para todos los dispositivos
- ⚡ **Alto Rendimiento**: Construido con React + Vite
- 🎨 **UI Moderna**: Interfaz profesional con Tailwind CSS y shadcn/ui

## 🚀 Tecnologías

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: Zustand
- **Routing**: React Router 7
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Deployment**: Docker + Nginx

## 📦 Instalación

### Prerequisitos

- Node.js 18+ o pnpm 10+
- Git

### Pasos de Instalación

```bash
# Clonar el repositorio
git clone https://github.com/andrescunier/DIAP.git
cd DIAP

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
pnpm dev
```

La aplicación estará disponible en: `http://localhost:5173`

## 🔧 Configuración

### Variables de Entorno Principales

```env
# Branding
VITE_APP_NAME=DIAP
VITE_COMPANY_NAME=DIAP
VITE_APP_SLOGAN=Tecnología profesional para empresas

# API
VITE_API_BASE_URL=https://api.cumar.com.ar
VITE_ACCOUNT_ID=tu-account-id

# Logos
VITE_LOGO_PATH=/diap-logo.png
```

## 📝 Scripts Disponibles

```bash
pnpm dev          # Iniciar servidor de desarrollo
pnpm build        # Construir para producción
pnpm preview      # Previsualizar build
pnpm lint         # Ejecutar ESLint
```

## 🐳 Docker Deployment

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## 📱 Contacto

- **Email**: info@diap.com
- **Teléfono**: +54 11 1234-5678

---

Desarrollado con ❤️ por el equipo de DIAP
