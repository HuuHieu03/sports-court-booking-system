import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Không dùng env() để `prisma generate` vẫn chạy được khi chưa có DATABASE_URL.
    url: process.env.DATABASE_URL ?? '',
  },
});
