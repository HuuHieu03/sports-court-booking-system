import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelVenueBookingDto {
  @ApiProperty({
    example: 'Sân bị sự cố hệ thống thoát nước sau mưa lớn.',
    description: 'Lý do hủy sân bắt buộc của Chủ sân / Quản lý (tối đa 1000 ký tự)',
  })
  @IsString({ message: 'Lý do hủy phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Lý do hủy sân không được để trống đối với Chủ sân và Quản lý' })
  @MaxLength(1000, { message: 'Lý do hủy sân không vượt quá 1000 ký tự' })
  reason: string;

  // Optional backward compatibility
  @IsOptional()
  @IsString({ message: 'cancellationReason phải là chuỗi ký tự' })
  cancellationReason?: string;
}
