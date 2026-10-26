import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AppointManagerDto {
  @ApiProperty({ example: '00000000-0000-4000-8000-000000004001' })
  @IsUUID('4', { message: 'applicationId phải là UUID hợp lệ' })
  @IsNotEmpty({ message: 'applicationId không được để trống' })
  applicationId: string;
}
