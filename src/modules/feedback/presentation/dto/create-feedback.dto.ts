import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({
    example: 'Mặt cỏ rất đẹp và sạch sẽ, bảo vệ nhiệt tình!',
    maxLength: 2000,
  })
  @IsString({ message: 'Nội dung góp ý phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Nội dung góp ý không được để trống' })
  @MaxLength(2000, { message: 'Nội dung góp ý không được vượt quá 2000 ký tự' })
  content: string;
}
