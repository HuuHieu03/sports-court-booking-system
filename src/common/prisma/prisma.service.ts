import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString =
      process.env.DATABASE_URL ||
      'postgresql://football:FootballSecret2026@localhost:5432/football_booking?schema=public&options=-c%20TimeZone%3DUTC';

    super({
      adapter: new PrismaPg({
        connectionString,
        options: '-c TimeZone=UTC',
      }),
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Đã kết nối thành công tới PostgreSQL qua Prisma Client');
    } catch (error) {
      this.logger.error('Lỗi kết nối CSDL PostgreSQL:', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Đã ngắt kết nối CSDL PostgreSQL');
  }
}
