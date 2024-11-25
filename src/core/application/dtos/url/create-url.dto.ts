import { IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUrlDto {
  @ApiProperty({
    example: 'https://very-long-url.com/some-path',
    description: 'The original URL to be shortened',
  })
  @IsUrl({}, { message: 'Please provide a valid URL' })
  originalUrl: string;
}