import { IsUrl, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUrlDto {
  @ApiProperty({
    example: 'https://exemplo-muito-longo.com/artigo/123',
    description: 'The original URL to be shortened',
  })
  @IsUrl({}, { message: 'Please provide a valid URL' })
  originalUrl: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID for authenticated requests',
  })
  @IsOptional()
  userId?: string;
}