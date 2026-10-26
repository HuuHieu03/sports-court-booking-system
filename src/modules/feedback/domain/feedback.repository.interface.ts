import { FeedbackEntity } from './feedback.entity';

export interface IFeedbackRepository {
  findById(id: string): Promise<FeedbackEntity | null>;
  findByVenueId(venueId: string): Promise<FeedbackEntity[]>;
  save(feedback: FeedbackEntity): Promise<FeedbackEntity>;
}
