export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export class Booking {
  constructor(
    public readonly id: string,
    public readonly courtId: string,
    public readonly customerId: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly totalAmount: number,
    public readonly status: BookingStatus = BookingStatus.PENDING,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}
}
