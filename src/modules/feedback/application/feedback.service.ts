import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FEEDBACK_REPOSITORY } from '../../../common/constants/tokens';
import { IFeedbackRepository } from '../domain/feedback.repository.interface';
import { VenuesService } from '../../venues/application/venues.service';
import { FeedbackEntity } from '../domain/feedback.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @Inject(FEEDBACK_REPOSITORY)
    private readonly feedbackRepository: IFeedbackRepository,
    private readonly venuesService: VenuesService,
  ) {}

  /**
   * Rule: Feedback authors are kept strictly anonymous from the public.
   */
  async getPublicFeedback(venueId: string) {
    const venue = await this.venuesService.findById(venueId);
    if (!venue || venue.deletedAt) {
      throw new NotFoundException('Cụm sân không tồn tại');
    }

    const items = await this.feedbackRepository.findByVenueId(venueId);
    return items.map((fb) => ({
      id: fb.id,
      venueId: fb.venueId,
      content: fb.content,
      createdAt: fb.createdAt.toISOString(),
    }));
  }

  async createFeedback(authorId: string, venueId: string, content: string) {
    const venue = await this.venuesService.findById(venueId);
    if (!venue || venue.deletedAt) {
      throw new NotFoundException('Cụm sân không tồn tại');
    }

    const trimmed = content ? content.trim() : '';
    if (trimmed.length === 0 || trimmed.length > 2000) {
      throw new BadRequestException('Nội dung góp ý phải từ 1 đến 2000 ký tự');
    }

    const feedback = new FeedbackEntity({
      id: crypto.randomUUID ? crypto.randomUUID() : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`,
      venueId,
      authorId,
      content: trimmed,
      createdAt: new Date(),
    });

    const saved = await this.feedbackRepository.save(feedback);
    return {
      id: saved.id,
      venueId: saved.venueId,
      content: saved.content,
      createdAt: saved.createdAt.toISOString(),
    };
  }
}
