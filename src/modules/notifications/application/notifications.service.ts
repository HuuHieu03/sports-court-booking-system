import { Injectable, Inject, Logger } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY } from '../../../common/constants/tokens';
import { INotificationRepository } from '../domain/notification.repository.interface';
import {
  NotificationEntity,
  NotificationType,
  NotificationStatus,
} from '../domain/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async createNotification(params: {
    recipientId: string;
    bookingId?: string | null;
    type: NotificationType;
  }): Promise<NotificationEntity> {
    const notif = new NotificationEntity({
      id: crypto.randomUUID ? crypto.randomUUID() : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`,
      recipientId: params.recipientId,
      bookingId: params.bookingId ?? null,
      type: params.type,
      status: 'PENDING',
      attemptCount: 0,
      createdAt: new Date(),
    });

    return this.notificationRepository.save(notif);
  }

  /**
   * HOOK-03: Synchronous Coupling instead of Asynchronous Outbox Pattern
   *
   * In this Baseline implementation, whenever a booking is cancelled by venue
   * or a manager is appointed, this synchronous method is called directly
   * inside the HTTP request loop with a simulated 800ms external network/IO delay.
   * This artificially degrades API response times and creates cascading failure risk
   * when notification services experience transient slowness.
   */
  async dispatchSync(params: {
    recipientId: string;
    bookingId?: string | null;
    type: NotificationType;
    message?: string;
  }): Promise<NotificationEntity> {
    this.logger.warn(
      `[HOOK-03] Executing synchronous notification dispatch for recipient ${params.recipientId} (blocking HTTP thread)...`,
    );

    // Create the outbox record
    const notif = await this.createNotification(params);

    // Simulate 800ms external SMS / Push Gateway network I/O lag
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mark as sent synchronously
    notif.markSent();
    await this.notificationRepository.update(notif);

    this.logger.log(`[HOOK-03] Synchronous notification ${notif.id} dispatched successfully.`);
    return notif;
  }

  async getNotificationsByUser(userId: string): Promise<NotificationEntity[]> {
    return this.notificationRepository.findByRecipientId(userId);
  }
}
