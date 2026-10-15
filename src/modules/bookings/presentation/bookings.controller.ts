import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookingsService } from '../application/bookings.service';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}
  // TODO [Phase-1]: Implement POST /bookings, GET /bookings/:id, DELETE /bookings/:id
}
