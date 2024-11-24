import { IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUrlDto {
  @ApiProperty({ example: 'https://novo-url.com/artigo/123' })
  @IsUrl()
  originalUrl: string;
}