import { NotificationEntity } from './notification.entity';

export interface INotificationRepository {
  findById(id: string): Promise<NotificationEntity | null>;
  findByRecipientId(recipientId: string): Promise<NotificationEntity[]>;
  findAll(): Promise<NotificationEntity[]>;
  save(notification: NotificationEntity): Promise<NotificationEntity>;
  update(notification: NotificationEntity): Promise<NotificationEntity>;
}
