import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class RecruitmentToggleDto {
  @ApiProperty({ example: true, description: 'Bật hoặc tắt tuyển dụng quản lý' })
  @IsBoolean({ message: 'isOpen phải là boolean' })
  @IsNotEmpty({ message: 'isOpen không được để trống' })
  isOpen: boolean;

  @ApiPropertyOptional({ example: 'Tuyển quản lý sân ca tối', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Thông điệp tuyển dụng không vượt quá 2000 ký tự' })
  message?: string;

  // Optional backward compatibility
  @IsOptional()
  @IsBoolean({ message: 'recruitmentOpen phải là boolean' })
  recruitmentOpen?: boolean;

  @IsOptional()
  @IsString({ message: 'recruitmentMessage phải là chuỗi ký tự' })
  recruitmentMessage?: string;
}
