import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Set global API prefix
  app.setGlobalPrefix('api/v1');

  // Enable CORS
  app.enableCors();

  // Apply Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Apply Global Exception Filter (RFC 7807 / OpenAPI ErrorResponse)
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Football Booking MVP API')
    .setDescription(
      'Ứng dụng giúp người dùng tìm và đặt sân bóng đá, đồng thời hỗ trợ chủ sân và quản lý vận hành cụm sân, theo dõi lịch đặt.',
    )
    .setVersion('0.2.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Football Booking Modular Monolith is running on: http://localhost:${port}/api/v1`);
  logger.log(`📚 OpenAPI Swagger documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
