import { Module } from '@nestjs/common';
import { BookingsController } from './presentation/bookings.controller';
import { BookingsService } from './application/bookings.service';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
