export type BookingStatus = 'CONFIRMED' | 'CANCELLED';

export interface BookingProps {
  id: string;
  courtId: string;
  venueId: string;
  userId: string;
  startsAt: Date;
  endsAt: Date;
  status: BookingStatus;
  cancelledAt?: Date | null;
  cancelledById?: string | null;
  cancellationReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class BookingEntity {
  public readonly id: string;
  public readonly courtId: string;
  public readonly venueId: string;
  public readonly userId: string;
  public readonly startsAt: Date;
  public readonly endsAt: Date;
  public status: BookingStatus;
  public cancelledAt: Date | null;
  public cancelledById: string | null;
  public cancellationReason: string | null;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: BookingProps) {
    this.id = props.id;
    this.courtId = props.courtId;
    this.venueId = props.venueId;
    this.userId = props.userId;
    this.startsAt = props.startsAt;
    this.endsAt = props.endsAt;
    this.status = props.status;
    this.cancelledAt = props.cancelledAt ?? null;
    this.cancelledById = props.cancelledById ?? null;
    this.cancellationReason = props.cancellationReason ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public isConfirmed(): boolean {
    return this.status === 'CONFIRMED';
  }

  public isCancelled(): boolean {
    return this.status === 'CANCELLED';
  }

  public getDurationMinutes(): number {
    return Math.round((this.endsAt.getTime() - this.startsAt.getTime()) / (1000 * 60));
  }

  public isTimeOverlapping(startsAt: Date, endsAt: Date): boolean {
    if (!this.isConfirmed()) {
      return false;
    }
    return this.startsAt.getTime() < endsAt.getTime() && this.endsAt.getTime() > startsAt.getTime();
  }

  public cancel(cancelledById: string, reason?: string | null): void {
    this.status = 'CANCELLED';
    this.cancelledAt = new Date();
    this.cancelledById = cancelledById;
    this.cancellationReason = reason ?? null;
    this.updatedAt = new Date();
  }
}
