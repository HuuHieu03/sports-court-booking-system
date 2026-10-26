import { Module, forwardRef } from '@nestjs/common';
import { BookingsController } from './presentation/bookings.controller';
import { MyBookingsController } from './presentation/my-bookings.controller';
import { VenueBookingsController } from './presentation/venue-bookings.controller';
import { BookingsService } from './application/bookings.service';
import { InMemoryBookingRepository } from './infrastructure/in-memory-booking.repository';
import { BOOKING_REPOSITORY } from '../../common/constants/tokens';
import { UsersModule } from '../users/users.module';
import { VenuesModule } from '../venues/venues.module';
import { StaffingModule } from '../staffing/staffing.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => VenuesModule),
    forwardRef(() => StaffingModule),
    NotificationsModule,
  ],
  controllers: [
    BookingsController,
    MyBookingsController,
    VenueBookingsController,
  ],
  providers: [
    BookingsService,
    {
      provide: BOOKING_REPOSITORY,
      useClass: InMemoryBookingRepository,
    },
  ],
  exports: [
    BookingsService,
  ],
})
export class BookingsModule {}
