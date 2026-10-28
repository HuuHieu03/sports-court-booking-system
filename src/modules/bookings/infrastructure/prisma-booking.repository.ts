import { Injectable } from '@nestjs/common';
import { IBookingRepository } from '../domain/booking.repository.interface';
import { BookingEntity, BookingStatus } from '../domain/booking.entity';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { Booking as PrismaBooking } from '../../../generated/prisma/client';

@Injectable()
export class PrismaBookingRepository implements IBookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(raw: PrismaBooking): BookingEntity {
    return new BookingEntity({
      id: raw.id,
      courtId: raw.courtId,
      venueId: raw.venueId,
      userId: raw.userId,
      startsAt: raw.startsAt,
      endsAt: raw.endsAt,
      totalPrice: raw.totalPrice,
      status: raw.status as BookingStatus,
      cancelledAt: raw.cancelledAt,
      cancelledById: raw.cancelledById,
      cancellationReason: raw.cancellationReason,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findById(id: string): Promise<BookingEntity | null> {
    const record = await this.prisma.booking.findUnique({ where: { id } });
    return record ? this.toEntity(record) : null;
  }

  async findByUserId(userId: string): Promise<BookingEntity[]> {
    const records = await this.prisma.booking.findMany({
      where: { userId },
      orderBy: { startsAt: 'desc' },
    });
    return records.map((r) => this.toEntity(r));
  }

  async findByVenueId(venueId: string): Promise<BookingEntity[]> {
    const records = await this.prisma.booking.findMany({
      where: { venueId },
      orderBy: { startsAt: 'desc' },
    });
    return records.map((r) => this.toEntity(r));
  }

  async findByCourtId(courtId: string): Promise<BookingEntity[]> {
    const records = await this.prisma.booking.findMany({
      where: { courtId },
      orderBy: { startsAt: 'asc' },
    });
    return records.map((r) => this.toEntity(r));
  }

  async findConflictingBookings(
    courtId: string,
    startsAt: Date,
    endsAt: Date,
    excludeBookingId?: string,
  ): Promise<BookingEntity[]> {
    const where: any = {
      courtId,
      status: 'CONFIRMED',
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    };
    if (excludeBookingId) {
      where.id = { not: excludeBookingId };
    }

    const records = await this.prisma.booking.findMany({ where });
    return records.map((r) => this.toEntity(r));
  }

  async isCourtAvailable(
    courtId: string,
    startsAt: Date,
    endsAt: Date,
    excludeBookingId?: string,
  ): Promise<boolean> {
    const conflicts = await this.findConflictingBookings(
      courtId,
      startsAt,
      endsAt,
      excludeBookingId,
    );
    return conflicts.length === 0;
  }

  async save(booking: BookingEntity): Promise<BookingEntity> {
    const created = await this.prisma.booking.create({
      data: {
        id: booking.id,
        courtId: booking.courtId,
        venueId: booking.venueId,
        userId: booking.userId,
        startsAt: booking.startsAt,
        endsAt: booking.endsAt,
        totalPrice: booking.totalPrice,
        status: booking.status as any,
        cancelledAt: booking.cancelledAt,
        cancelledById: booking.cancelledById,
        cancellationReason: booking.cancellationReason,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      },
    });
    return this.toEntity(created);
  }

  async update(booking: BookingEntity): Promise<BookingEntity> {
    const updated = await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: booking.status as any,
        cancelledAt: booking.cancelledAt,
        cancelledById: booking.cancelledById,
        cancellationReason: booking.cancellationReason,
        updatedAt: booking.updatedAt,
      },
    });
    return this.toEntity(updated);
  }
}
