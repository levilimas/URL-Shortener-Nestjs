import { IsUrl, IsNotEmpty, IsOptional, IsString, IsDateString, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateUrlDto {
  @ApiProperty({
    example: 'https://www.example.com/very-long-url-that-needs-shortening',
    description: 'The original URL to be shortened',
  })
  @IsUrl({}, { message: 'Please provide a valid URL' })
  @IsNotEmpty({ message: 'URL cannot be empty' })
  originalUrl: string;

  @ApiPropertyOptional({
    example: 'My awesome website link',
    description: 'Optional description for the shortened URL',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'myCustomCode',
    description: 'Custom short code (if not provided, will be auto-generated)',
    minLength: 3,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toLowerCase())
  customCode?: string;

  @ApiPropertyOptional({
    example: '2024-12-31T23:59:59.000Z',
    description: 'Expiration date for the URL (ISO 8601 format)',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({
    example: 'secretPassword123',
    description: 'Password protection for the URL',
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    example: 1000,
    description: 'Maximum number of clicks allowed',
    minimum: 1,
    maximum: 1000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000000)
  maxClicks?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Generate QR code for this URL',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  generateQrCode?: boolean;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID for authenticated requests',
  })
  @IsOptional()
  userId?: string;
}