import { Module } from '@nestjs/common';
import { VenuesController } from './presentation/venues.controller';
import { VenuesService } from './application/venues.service';

@Module({
  controllers: [VenuesController],
  providers: [VenuesService],
  exports: [VenuesService],
})
export class VenuesModule {}
