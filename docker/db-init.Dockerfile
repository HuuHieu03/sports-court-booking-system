# Chạy migration và seed vào service postgres rồi thoát. Dùng trong docker-compose.yml.
FROM node:24-slim

# Prisma schema engine cần OpenSSL.
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma.config.ts ./
COPY prisma ./prisma
RUN npx prisma generate

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed"]
