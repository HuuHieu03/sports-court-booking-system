import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Nguyễn Văn A', maxLength: 120 })
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @MaxLength(120, { message: 'Họ tên không được vượt quá 120 ký tự' })
  fullName: string;

  @ApiProperty({ example: 'nguyenvana@example.com', maxLength: 254 })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @MaxLength(254, { message: 'Email không được vượt quá 254 ký tự' })
  email: string;

  @ApiProperty({ example: '+84901234567', maxLength: 30 })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @MaxLength(30, { message: 'Số điện thoại không được vượt quá 30 ký tự' })
  phone: string;

  @ApiProperty({ example: 'Secret123@', minLength: 8, maxLength: 128 })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, { message: 'Mật khẩu phải có tối thiểu 8 ký tự' })
  @MaxLength(128, { message: 'Mật khẩu không được vượt quá 128 ký tự' })
  password: string;

  @ApiProperty({ enum: ['USER', 'OWNER'], example: 'USER' })
  @IsNotEmpty({ message: 'Vai trò không được để trống' })
  @IsIn(['USER', 'OWNER'], { message: 'Vai trò đăng ký phải là USER hoặc OWNER' })
  role: 'USER' | 'OWNER';
}
