import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CourtsService } from '../application/courts.service';

@ApiTags('Courts')
@Controller('courts')
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}
  // TODO [Phase-1]: Implement GET /courts, POST /courts, DELETE /courts/:id
}
