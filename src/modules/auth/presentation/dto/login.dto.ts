import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user.lan@example.com', description: 'Email hoặc số điện thoại' })
  @IsString({ message: 'Email hoặc số điện thoại phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Email hoặc số điện thoại không được để trống' })
  email: string;

  @ApiProperty({ example: 'Secret123@' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;
}
