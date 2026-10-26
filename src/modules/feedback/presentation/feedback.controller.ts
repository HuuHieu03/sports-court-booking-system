import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { FeedbackService } from '../application/feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser, AuthUser } from '../../../common/decorators/current-user.decorator';

/**
 * HOOK-05: Missing Rate Limiting on Feedback Endpoint
 *
 * Notice: This endpoint accepts submissions without distributed rate limiting.
 * An attacker or spam bot can flood a venue with thousands of feedback items.
 */
@ApiTags('Công khai', 'User')
@Controller('venues/:venueId/feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Xem các feedback của Venue (ẩn danh tác giả)', operationId: 'getVenueFeedback' })
  @ApiResponse({ status: 200, description: 'Danh sách góp ý ẩn danh' })
  async getVenueFeedback(@Param('venueId') venueId: string) {
    return this.feedbackService.getPublicFeedback(venueId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Gửi feedback cho Venue', operationId: 'postVenueFeedback' })
  @ApiResponse({ status: 201, description: 'Gửi feedback thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async createFeedback(
    @CurrentUser() user: AuthUser,
    @Param('venueId') venueId: string,
    @Body() dto: CreateFeedbackDto,
  ) {
    return this.feedbackService.createFeedback(user.userId, venueId, dto.content);
  }
}
