import { Injectable } from '@nestjs/common';
import { IVenueRepository, VenueFilter } from '../domain/venue.repository.interface';
import { VenueEntity } from '../domain/venue.entity';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

export const SEED_VENUES = {
  anPhu: id(2001),
  thaoDien: id(2002),
  thuDuc: id(2003),
};

@Injectable()
export class InMemoryVenueRepository implements IVenueRepository {
  private readonly venues: Map<string, VenueEntity> = new Map();

  constructor() {
    this.seedInitialVenues();
  }

  private seedInitialVenues() {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const initial = [
      new VenueEntity({
        id: SEED_VENUES.anPhu,
        ownerId: id(1002), // Trần Quốc An
        name: 'Sân bóng An Phú',
        address: '12 Đường số 5, An Phú, TP. Thủ Đức, TP. Hồ Chí Minh',
        description: 'Cụm sân cỏ nhân tạo phục vụ đặt sân theo giờ.',
        recruitmentOpen: true,
        recruitmentMessage: 'Tuyển quản lý sân ca chiều.',
        createdAt: tenDaysAgo,
        updatedAt: now,
      }),
      new VenueEntity({
        id: SEED_VENUES.thaoDien,
        ownerId: id(1002), // Trần Quốc An
        name: 'Sân bóng Thảo Điền',
        address: '45 Nguyễn Văn Hưởng, Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh',
        description: 'Cụm sân cỏ cao cấp tại Thảo Điền.',
        recruitmentOpen: false,
        recruitmentMessage: null,
        createdAt: tenDaysAgo,
        updatedAt: now,
      }),
      new VenueEntity({
        id: SEED_VENUES.thuDuc,
        ownerId: id(1003), // Lê Thu Hà
        name: 'Sân bóng Thủ Đức',
        address: '210 Võ Văn Ngân, Bình Thọ, TP. Thủ Đức, TP. Hồ Chí Minh',
        description: 'Có sân 5 người và sân 7 người.',
        recruitmentOpen: false,
        recruitmentMessage: null,
        createdAt: tenDaysAgo,
        updatedAt: now,
      }),
    ];

    for (const v of initial) {
      this.venues.set(v.id, v);
    }
  }

  async findById(id: string): Promise<VenueEntity | null> {
    return this.venues.get(id) || null;
  }

  async findByOwnerId(ownerId: string): Promise<VenueEntity[]> {
    return Array.from(this.venues.values()).filter(
      (v) => v.ownerId === ownerId && !v.deletedAt,
    );
  }

  async findAll(filter?: VenueFilter): Promise<VenueEntity[]> {
    let list = Array.from(this.venues.values()).filter((v) => !v.deletedAt);
    if (filter) {
      if (filter.recruitmentOnly) {
        list = list.filter((v) => v.recruitmentOpen);
      }
      if (filter.search) {
        const s = filter.search.toLowerCase();
        list = list.filter(
          (v) =>
            v.name.toLowerCase().includes(s) ||
            v.address.toLowerCase().includes(s),
        );
      }
    }
    return list;
  }

  async save(venue: VenueEntity): Promise<VenueEntity> {
    this.venues.set(venue.id, venue);
    return venue;
  }

  async update(venue: VenueEntity): Promise<VenueEntity> {
    this.venues.set(venue.id, venue);
    return venue;
  }
}
