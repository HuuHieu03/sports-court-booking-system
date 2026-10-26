import { Module } from '@nestjs/common';
import { NotificationsService } from './application/notifications.service';
import { InMemoryNotificationRepository } from './infrastructure/in-memory-notification.repository';
import { NOTIFICATION_REPOSITORY } from '../../common/constants/tokens';

@Module({
  providers: [
    NotificationsService,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: InMemoryNotificationRepository,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
