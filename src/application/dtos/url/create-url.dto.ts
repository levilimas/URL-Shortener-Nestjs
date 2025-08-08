import { IsUrl, IsNotEmpty, IsOptional, IsString, IsDateString, IsNumber, Min, Max, IsBoolean, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateUrlDto {
  @ApiProperty({
    description: 'The URL to be shortened',
  })
  @IsUrl({}, { message: 'Please provide a valid URL' })
  @IsNotEmpty({ message: 'URL is required' })
  originalUrl: string;

  @ApiPropertyOptional({
    description: 'Optional title for the URL',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Custom short code (optional)',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(10)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Custom code can only contain letters, numbers, hyphens, and underscores',
  })
  customCode?: string;

  @ApiPropertyOptional({
    description: 'Expiration date for the URL',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({
    description: 'Password to protect the URL',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of clicks allowed',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000000)
  maxClicks?: number;

  @ApiPropertyOptional({
    description: 'Whether to generate a QR code',
  })
  @IsOptional()
  @IsBoolean()
  generateQrCode?: boolean;

  @ApiPropertyOptional({
    description: 'User ID (for authenticated users)',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}