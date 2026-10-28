import { Module } from '@nestjs/common';
import { NotificationsService } from './application/notifications.service';
import { PrismaNotificationRepository } from './infrastructure/prisma-notification.repository';
import { NOTIFICATION_REPOSITORY } from '../../common/constants/tokens';

@Module({
  providers: [
    NotificationsService,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: PrismaNotificationRepository,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
