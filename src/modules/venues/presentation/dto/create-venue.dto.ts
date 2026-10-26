import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateVenueDto {
  @ApiProperty({ example: 'Sân bóng An Phú', maxLength: 200 })
  @IsString({ message: 'Tên cụm sân phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên cụm sân không được để trống' })
  @MaxLength(200, { message: 'Tên cụm sân không vượt quá 200 ký tự' })
  name: string;

  @ApiProperty({ example: '12 Đường số 5, An Phú, TP. Thủ Đức', maxLength: 500 })
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @MaxLength(500, { message: 'Địa chỉ không vượt quá 500 ký tự' })
  address: string;

  @ApiPropertyOptional({ example: 'Cụm sân cỏ nhân tạo cao cấp', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Mô tả không vượt quá 2000 ký tự' })
  description?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  recruitmentOpen?: boolean;

  @ApiPropertyOptional({ example: 'Tuyển quản lý sân ca tối', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Thông điệp tuyển dụng không vượt quá 2000 ký tự' })
  recruitmentMessage?: string;
}
