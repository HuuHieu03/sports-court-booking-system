import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCourtDto {
  @ApiProperty({ example: 'Sân 4', maxLength: 200 })
  @IsString({ message: 'Tên sân con phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên sân con không được để trống' })
  @MaxLength(200, { message: 'Tên sân con không vượt quá 200 ký tự' })
  name: string;

  @ApiPropertyOptional({ example: 'Sân cỏ 5 người mới hoàn thiện', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Mô tả không vượt quá 2000 ký tự' })
  description?: string;
}
