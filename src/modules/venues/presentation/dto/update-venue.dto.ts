import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateVenueDto {
  @ApiPropertyOptional({ example: 'Sân bóng An Phú Mới', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Tên cụm sân không vượt quá 200 ký tự' })
  name?: string;

  @ApiPropertyOptional({ example: '12B Đường số 5, An Phú, TP. Thủ Đức', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Địa chỉ không vượt quá 500 ký tự' })
  address?: string;

  @ApiPropertyOptional({ example: 'Mô tả cụm sân được cập nhật', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Mô tả không vượt quá 2000 ký tự' })
  description?: string;
}
