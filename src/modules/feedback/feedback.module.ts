import { Module } from '@nestjs/common';
import { FeedbackController } from './presentation/feedback.controller';
import { FeedbackService } from './application/feedback.service';
import { InMemoryFeedbackRepository } from './infrastructure/in-memory-feedback.repository';
import { FEEDBACK_REPOSITORY } from '../../common/constants/tokens';
import { UsersModule } from '../users/users.module';
import { VenuesModule } from '../venues/venues.module';

@Module({
  imports: [UsersModule, VenuesModule],
  controllers: [FeedbackController],
  providers: [
    FeedbackService,
    {
      provide: FEEDBACK_REPOSITORY,
      useClass: InMemoryFeedbackRepository,
    },
  ],
  exports: [FeedbackService],
})
export class FeedbackModule {}
