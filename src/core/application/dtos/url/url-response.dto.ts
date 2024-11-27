import { ApiProperty } from '@nestjs/swagger';

export class UrlResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier of the URL',
  })
  id: string;

  @ApiProperty({
    example: 'https://exemplo-muito-longo.com/artigo/123',
    description: 'Original URL',
  })
  originalUrl: string;

  @ApiProperty({
    example: 'abc123',
    description: 'Short code for the URL',
  })
  shortCode: string;

  @ApiProperty({
    example: 'http://localhost:3000/abc123',
    description: 'Complete shortened URL',
  })
  shortUrl: string;

  @ApiProperty({
    example: 42,
    description: 'Number of times this URL has been accessed',
  })
  clicks: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;
}