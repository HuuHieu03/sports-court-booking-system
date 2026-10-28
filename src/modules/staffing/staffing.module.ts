import { Module, forwardRef } from '@nestjs/common';
import { RecruitmentController } from './presentation/recruitment.controller';
import { ApplicationsController } from './presentation/applications.controller';
import { AppointmentsController } from './presentation/appointments.controller';
import { StaffingService } from './application/staffing.service';
import { PrismaStaffingRepository } from './infrastructure/prisma-staffing.repository';
import { STAFFING_REPOSITORY } from '../../common/constants/tokens';
import { UsersModule } from '../users/users.module';
import { VenuesModule } from '../venues/venues.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => VenuesModule),
    NotificationsModule,
  ],
  controllers: [
    RecruitmentController,
    ApplicationsController,
    AppointmentsController,
  ],
  providers: [
    StaffingService,
    {
      provide: STAFFING_REPOSITORY,
      useClass: PrismaStaffingRepository,
    },
  ],
  exports: [
    StaffingService,
  ],
})
export class StaffingModule {}
