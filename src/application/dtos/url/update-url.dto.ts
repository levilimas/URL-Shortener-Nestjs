import { IsUrl, IsOptional, IsString, IsDateString, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUrlDto {
  @ApiPropertyOptional({
    description: 'The original URL to be shortened',
  })
  @IsOptional()
  @IsUrl()
  originalUrl?: string;

  @ApiPropertyOptional({
    description: 'Description of the URL',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Expiration date for the URL (ISO 8601 format)',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({
    description: 'Whether the URL is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum number of clicks allowed',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxClicks?: number;
}