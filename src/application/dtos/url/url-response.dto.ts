import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UrlResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier for the URL',
  })
  id: string;

  @ApiProperty({
    example: 'https://www.example.com/very-long-url',
    description: 'The original URL',
  })
  originalUrl: string;

  @ApiProperty({
    example: 'abc123',
    description: 'The short code for the URL',
  })
  shortCode: string;

  @ApiProperty({
    example: 'https://short.ly/abc123',
    description: 'The complete shortened URL',
  })
  shortUrl: string;

  @ApiProperty({
    example: 42,
    description: 'Number of times the URL has been clicked',
  })
  clicks: number;

  @ApiPropertyOptional({
    example: 'My awesome link',
    description: 'Optional description for the URL',
  })
  description?: string;

  @ApiPropertyOptional({
    example: '2024-12-31T23:59:59.000Z',
    description: 'Expiration date for the URL',
  })
  expiresAt?: Date;

  @ApiProperty({
    example: true,
    description: 'Whether the URL is active',
  })
  isActive: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether this uses a custom short code',
  })
  isCustomCode: boolean;

  @ApiPropertyOptional({
    example: 'https://api.qrserver.com/v1/create-qr-code/?data=https://short.ly/abc123',
    description: 'QR code URL for this shortened link',
  })
  qrCodeUrl?: string;

  @ApiPropertyOptional({
    example: 1000,
    description: 'Maximum number of clicks allowed',
  })
  maxClicks?: number;

  @ApiProperty({
    example: false,
    description: 'Whether the URL has expired',
  })
  isExpired: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether the URL has reached maximum clicks',
  })
  hasReachedMaxClicks: boolean;

  @ApiProperty({
    example: true,
    description: 'Whether the URL is accessible (active, not expired, not at max clicks)',
  })
  isAccessible: boolean;

  @ApiProperty({
    example: '2023-12-01T10:00:00.000Z',
    description: 'When the URL was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-12-01T10:00:00.000Z',
    description: 'When the URL was last updated',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the user who created this URL',
  })
  userId?: string;
}