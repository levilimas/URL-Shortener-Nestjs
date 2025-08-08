import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UrlResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the URL',
  })
  id: string;

  @ApiProperty({
    description: 'The original URL',
  })
  originalUrl: string;

  @ApiProperty({
    description: 'The short code for the URL',
  })
  shortCode: string;

  @ApiProperty({
    description: 'The complete shortened URL',
  })
  shortUrl: string;

  @ApiProperty({
    description: 'Number of times the URL has been clicked',
  })
  clicks: number;

  @ApiPropertyOptional({
    description: 'Optional description for the URL',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Expiration date for the URL',
  })
  expiresAt?: Date;

  @ApiProperty({
    description: 'Whether the URL is active',
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether this uses a custom short code',
  })
  isCustomCode: boolean;

  @ApiPropertyOptional({
    description: 'QR code URL for this shortened link',
  })
  qrCodeUrl?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of clicks allowed',
  })
  maxClicks?: number;

  @ApiProperty({
    description: 'Whether the URL has expired',
  })
  isExpired: boolean;

  @ApiProperty({
    description: 'Whether the URL has reached maximum clicks',
  })
  hasReachedMaxClicks: boolean;

  @ApiProperty({
    description: 'Whether the URL is accessible (active, not expired, not at max clicks)',
  })
  isAccessible: boolean;

  @ApiProperty({
    description: 'When the URL was created',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the URL was last updated',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'ID of the user who created this URL',
  })
  userId?: string;
}