# Dockerfile para DIAP B2B E-commerce Platform
# Imagen multi-tenant con configuración runtime
FROM node:20-alpine AS builder

# Build arguments para configuración por ambiente
ARG VITE_API_BASE_URL=https://api.cumar.com.ar
ARG VITE_ACCOUNT_ID=37b694f4-f2c9-4500-8e47-52b8ad8daaea
ARG VITE_APP_ENV=production

# Pasar ARGs a ENV para que Vite los use en build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_ACCOUNT_ID=$VITE_ACCOUNT_ID
ENV VITE_APP_ENV=$VITE_APP_ENV

# Instalar pnpm
RUN npm install -g pnpm

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN pnpm build

# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar archivos estáticos desde el builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar template de configuración y entrypoint
COPY config.js.template /app/config.js.template
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Hacer ejecutable el entrypoint
RUN chmod +x /docker-entrypoint.sh

# Exponer puerto 80
EXPOSE 80

# Usar entrypoint personalizado para generar config.js
ENTRYPOINT ["/docker-entrypoint.sh"]
