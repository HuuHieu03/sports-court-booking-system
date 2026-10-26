export type NotificationType =
  | 'BOOKING_CANCELLED_BY_VENUE'
  | 'MANAGER_APPOINTED'
  | 'BOOKING_CONFIRMED';

export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface NotificationProps {
  id: string;
  recipientId: string;
  bookingId?: string | null;
  type: NotificationType;
  status: NotificationStatus;
  attemptCount?: number;
  lastError?: string | null;
  createdAt: Date;
  sentAt?: Date | null;
}

export class NotificationEntity {
  public readonly id: string;
  public recipientId: string;
  public bookingId: string | null;
  public type: NotificationType;
  public status: NotificationStatus;
  public attemptCount: number;
  public lastError: string | null;
  public createdAt: Date;
  public sentAt: Date | null;

  constructor(props: NotificationProps) {
    this.id = props.id;
    this.recipientId = props.recipientId;
    this.bookingId = props.bookingId ?? null;
    this.type = props.type;
    this.status = props.status;
    this.attemptCount = props.attemptCount ?? 0;
    this.lastError = props.lastError ?? null;
    this.createdAt = props.createdAt;
    this.sentAt = props.sentAt ?? null;
  }

  public markSent(): void {
    this.status = 'SENT';
    this.sentAt = new Date();
    this.attemptCount += 1;
  }

  public markFailed(error: string): void {
    this.status = 'FAILED';
    this.lastError = error;
    this.attemptCount += 1;
  }
}
