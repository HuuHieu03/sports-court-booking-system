import { Module } from '@nestjs/common';
import { HealthModule } from './common/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { VenuesModule } from './modules/venues/venues.module';
import { CourtsModule } from './modules/courts/courts.module';
import { BookingsModule } from './modules/bookings/bookings.module';

@Module({
  imports: [
    HealthModule,
    AuthModule,
    UsersModule,
    VenuesModule,
    CourtsModule,
    BookingsModule,
  ],
})
export class AppModule {}
