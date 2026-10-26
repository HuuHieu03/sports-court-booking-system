import { Injectable } from '@nestjs/common';
import { IFeedbackRepository } from '../domain/feedback.repository.interface';
import { FeedbackEntity } from '../domain/feedback.entity';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

export const SEED_FEEDBACK = {
  f1: id(7001),
  f2: id(7002),
};

@Injectable()
export class InMemoryFeedbackRepository implements IFeedbackRepository {
  private readonly feedbackList: Map<string, FeedbackEntity> = new Map();

  constructor() {
    this.seedInitialFeedback();
  }

  private seedInitialFeedback() {
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

    const initial = [
      new FeedbackEntity({
        id: SEED_FEEDBACK.f1,
        venueId: id(2001),
        authorId: id(1005), // Lan
        content: 'Sân sạch, dễ tìm đường.',
        createdAt: daysAgo(5),
      }),
      new FeedbackEntity({
        id: SEED_FEEDBACK.f2,
        venueId: id(2003),
        authorId: id(1006), // Huy
        content: 'Mặt cỏ tốt, có chỗ gửi xe rộng.',
        createdAt: daysAgo(3),
      }),
    ];

    for (const fb of initial) {
      this.feedbackList.set(fb.id, fb);
    }
  }

  async findById(id: string): Promise<FeedbackEntity | null> {
    return this.feedbackList.get(id) || null;
  }

  async findByVenueId(venueId: string): Promise<FeedbackEntity[]> {
    return Array.from(this.feedbackList.values())
      .filter((fb) => fb.venueId === venueId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async save(feedback: FeedbackEntity): Promise<FeedbackEntity> {
    this.feedbackList.set(feedback.id, feedback);
    return feedback;
  }
}
