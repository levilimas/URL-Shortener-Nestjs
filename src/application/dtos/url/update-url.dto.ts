import { IsUrl, IsOptional, IsString, IsDateString, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUrlDto {
  @ApiProperty({
    description: 'The original URL to be shortened',
    example: 'https://www.example.com/very-long-url',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  originalUrl?: string;

  @ApiProperty({
    description: 'Description of the URL',
    example: 'My important link',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Expiration date for the URL (ISO 8601 format)',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({
    description: 'Whether the URL is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Maximum number of clicks allowed',
    example: 1000,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxClicks?: number;
}