import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UrlResponseDto {
  @ApiProperty({
    description: 'Identificador único da URL',
  })
  id: string;

  @ApiProperty({
    description: 'URL original',
  })
  originalUrl: string;

  @ApiProperty({
    description: 'Código curto da URL',
  })
  shortCode: string;

  @ApiProperty({
    description: 'URL encurtada completa',
  })
  shortUrl: string;

  @ApiProperty({
    description: 'Número de cliques',
  })
  clicks: number;

  @ApiPropertyOptional({
    description: 'Data de expiração da URL',
  })
  expiresAt?: Date;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;
}