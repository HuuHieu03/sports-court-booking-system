import { Module, forwardRef } from '@nestjs/common';
import { VenuesController } from './presentation/venues.controller';
import { CourtsController } from './presentation/courts.controller';
import { VenuesService } from './application/venues.service';
import { CourtsService } from './application/courts.service';
import { PrismaVenueRepository } from './infrastructure/prisma-venue.repository';
import { PrismaCourtRepository } from './infrastructure/prisma-court.repository';
import { VENUE_REPOSITORY, COURT_REPOSITORY } from '../../common/constants/tokens';
import { UsersModule } from '../users/users.module';
import { BookingsModule } from '../bookings/bookings.module';
import { StaffingModule } from '../staffing/staffing.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => BookingsModule),
    forwardRef(() => StaffingModule),
  ],
  controllers: [VenuesController, CourtsController],
  providers: [
    VenuesService,
    CourtsService,
    {
      provide: VENUE_REPOSITORY,
      useClass: PrismaVenueRepository,
    },
    {
      provide: COURT_REPOSITORY,
      useClass: PrismaCourtRepository,
    },
  ],
  exports: [
    VenuesService,
    CourtsService,
  ],
})
export class VenuesModule {}
