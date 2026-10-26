import { Injectable } from '@nestjs/common';
import { INotificationRepository } from '../domain/notification.repository.interface';
import { NotificationEntity } from '../domain/notification.entity';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

@Injectable()
export class InMemoryNotificationRepository implements INotificationRepository {
  private readonly notifications: Map<string, NotificationEntity> = new Map();

  constructor() {
    this.seedInitialNotifications();
  }

  private seedInitialNotifications() {
    const initial = [
      new NotificationEntity({
        id: id(8001),
        recipientId: id(1006), // Huy
        bookingId: id(6004),
        type: 'BOOKING_CANCELLED_BY_VENUE',
        status: 'PENDING',
        attemptCount: 0,
        createdAt: new Date(),
      }),
    ];

    for (const notif of initial) {
      this.notifications.set(notif.id, notif);
    }
  }

  async findById(id: string): Promise<NotificationEntity | null> {
    return this.notifications.get(id) || null;
  }

  async findByRecipientId(recipientId: string): Promise<NotificationEntity[]> {
    return Array.from(this.notifications.values()).filter(
      (n) => n.recipientId === recipientId,
    );
  }

  async findAll(): Promise<NotificationEntity[]> {
    return Array.from(this.notifications.values());
  }

  async save(notification: NotificationEntity): Promise<NotificationEntity> {
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async update(notification: NotificationEntity): Promise<NotificationEntity> {
    this.notifications.set(notification.id, notification);
    return notification;
  }
}
