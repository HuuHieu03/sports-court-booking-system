import { Injectable } from '@nestjs/common';
import { IFeedbackRepository } from '../domain/feedback.repository.interface';
import { FeedbackEntity } from '../domain/feedback.entity';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { Feedback as PrismaFeedback } from '../../../generated/prisma/client';

@Injectable()
export class PrismaFeedbackRepository implements IFeedbackRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(raw: PrismaFeedback): FeedbackEntity {
    return new FeedbackEntity({
      id: raw.id,
      venueId: raw.venueId,
      authorId: raw.authorId,
      content: raw.content,
      createdAt: raw.createdAt,
    });
  }

  async findById(id: string): Promise<FeedbackEntity | null> {
    const record = await this.prisma.feedback.findUnique({ where: { id } });
    return record ? this.toEntity(record) : null;
  }

  async findByVenueId(venueId: string): Promise<FeedbackEntity[]> {
    const records = await this.prisma.feedback.findMany({
      where: { venueId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.toEntity(r));
  }

  async save(feedback: FeedbackEntity): Promise<FeedbackEntity> {
    const created = await this.prisma.feedback.create({
      data: {
        id: feedback.id,
        venueId: feedback.venueId,
        authorId: feedback.authorId,
        content: feedback.content,
        createdAt: feedback.createdAt,
      },
    });
    return this.toEntity(created);
  }
}
