import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class ApplyManagerDto {
  @ApiProperty({ example: true, description: 'Đồng ý chia sẻ thông tin liên hệ cho chủ sân' })
  @IsBoolean({ message: 'consentToShareContact phải là boolean' })
  @IsNotEmpty({ message: 'consentToShareContact không được để trống' })
  consentToShareContact: boolean;

  // Optional backward compatibility
  @IsOptional()
  @IsBoolean({ message: 'consented phải là boolean' })
  consented?: boolean;
}
