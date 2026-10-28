import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCourtDto {
  @ApiProperty({ example: 'Sân 4', maxLength: 200 })
  @IsString({ message: 'Tên sân con phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên sân con không được để trống' })
  @MaxLength(200, { message: 'Tên sân con không vượt quá 200 ký tự' })
  name: string;

  @ApiPropertyOptional({ example: 300000, description: 'Đơn giá thuê sân mỗi giờ (VND)' })
  @IsOptional()
  @IsInt({ message: 'Đơn giá thuê mỗi giờ phải là số nguyên' })
  @Min(0, { message: 'Đơn giá thuê mỗi giờ không được âm' })
  hourlyRate?: number;

  @ApiPropertyOptional({ example: 'Sân cỏ 5 người mới hoàn thiện', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Mô tả không vượt quá 2000 ký tự' })
  description?: string;
}
