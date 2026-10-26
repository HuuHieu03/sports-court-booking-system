import { Injectable } from '@nestjs/common';
import { ICourtRepository } from '../domain/court.repository.interface';
import { CourtEntity } from '../domain/court.entity';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

export const SEED_COURTS = {
  anPhu1: id(3001),
  anPhu2: id(3002),
  anPhu3: id(3003),
  thaoDienA: id(3004),
  thaoDienB: id(3005),
  thaoDienDeleted: id(3006),
  thuDuc5: id(3007),
  thuDuc7: id(3008),
};

@Injectable()
export class InMemoryCourtRepository implements ICourtRepository {
  private readonly courts: Map<string, CourtEntity> = new Map();

  constructor() {
    this.seedInitialCourts();
  }

  private seedInitialCourts() {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const initial = [
      new CourtEntity({
        id: SEED_COURTS.anPhu1,
        venueId: id(2001),
        name: 'Sân 1',
        description: 'Sân 5 người.',
        createdAt: tenDaysAgo,
        updatedAt: now,
      }),
      new CourtEntity({
        id: SEED_COURTS.anPhu2,
        venueId: id(2001),
        name: 'Sân 2',
        description: 'Sân 5 người.',
        createdAt: tenDaysAgo,
        updatedAt: now,
      }),
      new CourtEntity({
        id: SEED_COURTS.anPhu3,
        venueId: id(2001),
        name: 'Sân 3',
        description: 'Sân 7 người.',
        createdAt: tenDaysAgo,
        updatedAt: now,
      }),
      new CourtEntity({
        id: SEED_COURTS.thaoDienA,
        venueId: id(2002),
        name: 'Sân A',
        description: 'Sân cỏ tiêu chuẩn',
        createdAt: tenDaysAgo,
        updatedAt: now,
      }),
      new CourtEntity({
        id: SEED_COURTS.thaoDienB,
        venueId: id(2002),
        name: 'Sân B',
        description: null,
        createdAt: tenDaysAgo,
        updatedAt: now,
      }),
      new CourtEntity({
        id: SEED_COURTS.thaoDienDeleted,
        venueId: id(2002),
        name: 'Sân C',
        description: 'Đã xóa logic.',
        createdAt: tenDaysAgo,
        updatedAt: now,
        deletedAt: tenDaysAgo,
      }),
      new CourtEntity({
        id: SEED_COURTS.thuDuc5,
        venueId: id(2003),
        name: 'Sân 5 người',
        description: null,
        createdAt: tenDaysAgo,
        updatedAt: now,
      }),
      new CourtEntity({
        id: SEED_COURTS.thuDuc7,
        venueId: id(2003),
        name: 'Sân 7 người',
        description: null,
        createdAt: tenDaysAgo,
        updatedAt: now,
      }),
    ];

    for (const c of initial) {
      this.courts.set(c.id, c);
    }
  }

  async findById(id: string): Promise<CourtEntity | null> {
    return this.courts.get(id) || null;
  }

  async findByVenueId(venueId: string, includeDeleted = false): Promise<CourtEntity[]> {
    return Array.from(this.courts.values()).filter(
      (c) => c.venueId === venueId && (includeDeleted || !c.deletedAt),
    );
  }

  async save(court: CourtEntity): Promise<CourtEntity> {
    this.courts.set(court.id, court);
    return court;
  }

  async update(court: CourtEntity): Promise<CourtEntity> {
    this.courts.set(court.id, court);
    return court;
  }
}
