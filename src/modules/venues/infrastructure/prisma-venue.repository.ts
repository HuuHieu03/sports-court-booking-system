import { Injectable } from '@nestjs/common';
import { IVenueRepository, VenueFilter } from '../domain/venue.repository.interface';
import { VenueEntity } from '../domain/venue.entity';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { Venue as PrismaVenue } from '../../../generated/prisma/client';

@Injectable()
export class PrismaVenueRepository implements IVenueRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(raw: PrismaVenue): VenueEntity {
    return new VenueEntity({
      id: raw.id,
      ownerId: raw.ownerId,
      name: raw.name,
      address: raw.address,
      description: raw.description,
      recruitmentOpen: raw.recruitmentOpen,
      recruitmentMessage: raw.recruitmentMessage,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  async findById(id: string): Promise<VenueEntity | null> {
    const record = await this.prisma.venue.findUnique({ where: { id } });
    return record ? this.toEntity(record) : null;
  }

  async findByOwnerId(ownerId: string): Promise<VenueEntity[]> {
    const records = await this.prisma.venue.findMany({
      where: {
        ownerId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.toEntity(r));
  }

  async findAll(filter?: VenueFilter): Promise<VenueEntity[]> {
    const where: any = { deletedAt: null };
    if (filter?.recruitmentOnly) {
      where.recruitmentOpen = true;
    }
    if (filter?.search) {
      const s = filter.search.toLowerCase().trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { address: { contains: s, mode: 'insensitive' } },
      ];
    }

    const records = await this.prisma.venue.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.toEntity(r));
  }

  async save(venue: VenueEntity): Promise<VenueEntity> {
    const created = await this.prisma.venue.create({
      data: {
        id: venue.id,
        ownerId: venue.ownerId,
        name: venue.name,
        address: venue.address,
        description: venue.description,
        recruitmentOpen: venue.recruitmentOpen,
        recruitmentMessage: venue.recruitmentMessage,
        createdAt: venue.createdAt,
        updatedAt: venue.updatedAt,
        deletedAt: venue.deletedAt,
      },
    });
    return this.toEntity(created);
  }

  async update(venue: VenueEntity): Promise<VenueEntity> {
    const updated = await this.prisma.venue.update({
      where: { id: venue.id },
      data: {
        name: venue.name,
        address: venue.address,
        description: venue.description,
        recruitmentOpen: venue.recruitmentOpen,
        recruitmentMessage: venue.recruitmentMessage,
        updatedAt: venue.updatedAt,
        deletedAt: venue.deletedAt,
      },
    });
    return this.toEntity(updated);
  }
}
