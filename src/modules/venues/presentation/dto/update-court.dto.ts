import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateCourtDto {
  @ApiPropertyOptional({ example: 'Sân 4 (Cải tạo)', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Tên sân con không vượt quá 200 ký tự' })
  name?: string;

  @ApiPropertyOptional({ example: 300000, description: 'Đơn giá thuê sân mỗi giờ (VND)' })
  @IsOptional()
  @IsInt({ message: 'Đơn giá thuê mỗi giờ phải là số nguyên' })
  @Min(0, { message: 'Đơn giá thuê mỗi giờ không được âm' })
  hourlyRate?: number;

  @ApiPropertyOptional({ example: 'Sân 5 người cỏ nhân tạo mới thay mặt cỏ', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Mô tả không vượt quá 2000 ký tự' })
  description?: string;
}
