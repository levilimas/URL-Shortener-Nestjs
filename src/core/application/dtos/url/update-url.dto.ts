import { IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUrlDto {
  @ApiProperty({ description: 'Nova URL original' })
  @IsUrl()
  originalUrl: string;
}