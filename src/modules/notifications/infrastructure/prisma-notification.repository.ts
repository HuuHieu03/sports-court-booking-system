import { Injectable } from '@nestjs/common';
import { INotificationRepository } from '../domain/notification.repository.interface';
import {
  NotificationEntity,
  NotificationType,
  NotificationStatus,
} from '../domain/notification.entity';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { Notification as PrismaNotification } from '../../../generated/prisma/client';

@Injectable()
export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(raw: PrismaNotification): NotificationEntity {
    return new NotificationEntity({
      id: raw.id,
      recipientId: raw.recipientId,
      bookingId: raw.bookingId,
      type: raw.type as NotificationType,
      status: raw.status as NotificationStatus,
      attemptCount: raw.attemptCount,
      lastError: raw.lastError,
      createdAt: raw.createdAt,
      sentAt: raw.sentAt,
    });
  }

  async findById(id: string): Promise<NotificationEntity | null> {
    const record = await this.prisma.notification.findUnique({ where: { id } });
    return record ? this.toEntity(record) : null;
  }

  async findByRecipientId(recipientId: string): Promise<NotificationEntity[]> {
    const records = await this.prisma.notification.findMany({
      where: { recipientId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.toEntity(r));
  }

  async findAll(): Promise<NotificationEntity[]> {
    const records = await this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.toEntity(r));
  }

  async save(notification: NotificationEntity): Promise<NotificationEntity> {
    const created = await this.prisma.notification.create({
      data: {
        id: notification.id,
        recipientId: notification.recipientId,
        bookingId: notification.bookingId,
        type: notification.type as any,
        status: notification.status as any,
        attemptCount: notification.attemptCount,
        lastError: notification.lastError,
        createdAt: notification.createdAt,
        sentAt: notification.sentAt,
      },
    });
    return this.toEntity(created);
  }

  async update(notification: NotificationEntity): Promise<NotificationEntity> {
    const updated = await this.prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: notification.status as any,
        attemptCount: notification.attemptCount,
        lastError: notification.lastError,
        sentAt: notification.sentAt,
      },
    });
    return this.toEntity(updated);
  }
}
