import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VenuesService } from '../application/venues.service';

@ApiTags('Venues')
@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}
  // TODO [Phase-1]: Implement GET /venues, POST /venues, DELETE /venues/:id
}
