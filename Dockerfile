# syntax=docker/dockerfile:1
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare --activate

COPY . .
RUN pnpm install --frozen-lockfile

# Dummy values so Vite doesn't tree-shake bootstrap code.
# Real values are injected at runtime via docker-entrypoint.sh → config.js
ENV VITE_ACCOUNT_ID=build-placeholder
ENV VITE_API_BASE_URL=https://api.cumar.com.ar
RUN pnpm build

FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN sed -i 's/\r$//' /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
