import { Injectable } from '@nestjs/common';
import { ICourtRepository } from '../domain/court.repository.interface';
import { CourtEntity } from '../domain/court.entity';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { Court as PrismaCourt } from '../../../generated/prisma/client';

@Injectable()
export class PrismaCourtRepository implements ICourtRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(raw: PrismaCourt): CourtEntity {
    return new CourtEntity({
      id: raw.id,
      venueId: raw.venueId,
      name: raw.name,
      description: raw.description,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  async findById(id: string): Promise<CourtEntity | null> {
    const record = await this.prisma.court.findUnique({ where: { id } });
    return record ? this.toEntity(record) : null;
  }

  async findByVenueId(venueId: string, includeDeleted = false): Promise<CourtEntity[]> {
    const where: any = { venueId };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    const records = await this.prisma.court.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
    return records.map((r) => this.toEntity(r));
  }

  async save(court: CourtEntity): Promise<CourtEntity> {
    const created = await this.prisma.court.create({
      data: {
        id: court.id,
        venueId: court.venueId,
        name: court.name,
        description: court.description,
        createdAt: court.createdAt,
        updatedAt: court.updatedAt,
        deletedAt: court.deletedAt,
      },
    });
    return this.toEntity(created);
  }

  async update(court: CourtEntity): Promise<CourtEntity> {
    const updated = await this.prisma.court.update({
      where: { id: court.id },
      data: {
        name: court.name,
        description: court.description,
        updatedAt: court.updatedAt,
        deletedAt: court.deletedAt,
      },
    });
    return this.toEntity(updated);
  }
}
