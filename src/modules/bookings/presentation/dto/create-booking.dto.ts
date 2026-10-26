import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: '00000000-0000-4000-8000-000000003001' })
  @IsUUID('4', { message: 'courtId phải là UUID hợp lệ' })
  @IsNotEmpty({ message: 'courtId không được để trống' })
  courtId: string;

  @ApiProperty({ example: '2026-10-27T18:00:00Z', description: 'Thời gian bắt đầu theo chuẩn ISO 8601 / UTC' })
  @IsISO8601({}, { message: 'startsAt phải là định dạng ISO 8601 hợp lệ' })
  @IsNotEmpty({ message: 'startsAt không được để trống' })
  startsAt: string;

  @ApiProperty({ example: '2026-10-27T19:30:00Z', description: 'Thời gian kết thúc theo chuẩn ISO 8601 / UTC' })
  @IsISO8601({}, { message: 'endsAt phải là định dạng ISO 8601 hợp lệ' })
  @IsNotEmpty({ message: 'endsAt không được để trống' })
  endsAt: string;
}
