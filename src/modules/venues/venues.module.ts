import { Module, forwardRef } from '@nestjs/common';
import { VenuesController } from './presentation/venues.controller';
import { CourtsController } from './presentation/courts.controller';
import { VenuesService } from './application/venues.service';
import { CourtsService } from './application/courts.service';
import { InMemoryVenueRepository } from './infrastructure/in-memory-venue.repository';
import { InMemoryCourtRepository } from './infrastructure/in-memory-court.repository';
import { VENUE_REPOSITORY, COURT_REPOSITORY } from '../../common/constants/tokens';
import { UsersModule } from '../users/users.module';
import { BookingsModule } from '../bookings/bookings.module';
import { StaffingModule } from '../staffing/staffing.module';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => BookingsModule),
    forwardRef(() => StaffingModule),
  ],
  controllers: [VenuesController, CourtsController],
  providers: [
    VenuesService,
    CourtsService,
    {
      provide: VENUE_REPOSITORY,
      useClass: InMemoryVenueRepository,
    },
    {
      provide: COURT_REPOSITORY,
      useClass: InMemoryCourtRepository,
    },
  ],
  exports: [
    VenuesService,
    CourtsService,
  ],
})
export class VenuesModule {}
