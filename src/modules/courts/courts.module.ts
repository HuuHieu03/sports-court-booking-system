import { Module } from '@nestjs/common';
import { CourtsController } from './presentation/courts.controller';
import { CourtsService } from './application/courts.service';

@Module({
  controllers: [CourtsController],
  providers: [CourtsService],
  exports: [CourtsService],
})
export class CourtsModule {}
