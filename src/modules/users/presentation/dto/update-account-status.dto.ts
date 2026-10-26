import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateAccountStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'LOCKED'], example: 'LOCKED' })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsIn(['ACTIVE', 'LOCKED'], { message: 'Trạng thái phải là ACTIVE hoặc LOCKED' })
  status: 'ACTIVE' | 'LOCKED';
}
