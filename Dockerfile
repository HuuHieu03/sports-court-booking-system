# ==============================================================================
# UNIFIED MULTI-TARGET DOCKERFILE FOR FOOTBALL BOOKING MVP
# Targets:
#   - 'backend': NestJS Modular Monolith Runtime
#   - 'frontend': React Vite SPA served via NGINX with Reverse Proxy
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: Backend Builder
# ------------------------------------------------------------------------------
FROM node:20-alpine AS backend-builder
WORKDIR /app

# 1. Tận dụng cache Docker: copy file cấu hình & dependencies
COPY package*.json tsconfig*.json prisma.config.ts ./
RUN npm ci

# 2. Copy schema Prisma và sinh mã Prisma Client
COPY prisma ./prisma
RUN npx prisma generate

# 3. Copy toàn bộ mã nguồn backend và biên dịch TypeScript ra thư mục dist/
COPY src ./src
RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 2: Backend Production Target (target: backend)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS backend
WORKDIR /app
ENV NODE_ENV=production

# 1. Cài đặt production dependencies
COPY package*.json ./
RUN npm ci --only=production

# 2. Copy bản build và Prisma client từ stage backend-builder
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/src/generated ./src/generated
COPY --from=backend-builder /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "dist/main.js"]

# ------------------------------------------------------------------------------
# STAGE 3: Frontend Builder
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# 1. Copy dependencies của frontend và cài đặt
COPY frontend/package*.json ./
RUN npm ci

# 2. Copy toàn bộ mã nguồn frontend và đóng gói ra thư mục dist/
COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 4: Frontend Production Target (target: frontend)
# ------------------------------------------------------------------------------
FROM nginx:alpine AS frontend

# 1. Cấu hình NGINX phục vụ SPA và reverse proxy sang backend
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 2. Copy file tĩnh đã build từ stage frontend-builder vào thư mục web root của NGINX
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
