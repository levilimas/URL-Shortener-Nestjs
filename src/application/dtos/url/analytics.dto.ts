import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClickAnalyticsDto {
  @ApiProperty({
    description: 'Unique identifier for the click event',
  })
  id: string;

  @ApiProperty({
    description: 'When the click occurred',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Country where the click originated',
  })
  country?: string;

  @ApiPropertyOptional({
    description: 'City where the click originated',
  })
  city?: string;

  @ApiPropertyOptional({
    description: 'Region/state where the click originated',
  })
  region?: string;

  @ApiPropertyOptional({
    description: 'Device type used for the click',
  })
  device?: string;

  @ApiPropertyOptional({
    description: 'Browser used for the click',
  })
  browser?: string;

  @ApiPropertyOptional({
    description: 'Operating system used for the click',
  })
  operatingSystem?: string;

  @ApiProperty({
    description: 'Whether the click came from a mobile device',
  })
  isMobile: boolean;

  @ApiProperty({
    description: 'Whether the click came from a bot',
  })
  isBot: boolean;

  @ApiPropertyOptional({
    description: 'Referrer URL',
  })
  referer?: string;

  @ApiPropertyOptional({
    description: 'Language preference',
  })
  language?: string;

  @ApiPropertyOptional({
    description: 'UTM source parameter',
  })
  utmSource?: string;

  @ApiPropertyOptional({
    description: 'UTM medium parameter',
  })
  utmMedium?: string;

  @ApiPropertyOptional({
    description: 'UTM campaign parameter',
  })
  utmCampaign?: string;
}

export class UrlAnalyticsDto {
  @ApiProperty({
    description: 'Total number of clicks',
  })
  totalClicks: number;

  @ApiProperty({
    description: 'Number of unique clicks (excluding bots)',
  })
  uniqueClicks: number;

  @ApiProperty({
    description: 'Number of bot clicks',
  })
  botClicks: number;

  @ApiProperty({
    description: 'Number of mobile clicks',
  })
  mobileClicks: number;

  @ApiProperty({
    description: 'Number of desktop clicks',
  })
  desktopClicks: number;

  @ApiProperty({
    type: [ClickAnalyticsDto],
    description: 'Recent click events',
  })
  recentClicks: ClickAnalyticsDto[];

  @ApiProperty({
    description: 'Clicks by country',
  })
  clicksByCountry: Record<string, number>;

  @ApiProperty({
    description: 'Clicks by browser',
  })
  clicksByBrowser: Record<string, number>;

  @ApiProperty({
    description: 'Clicks by operating system',
  })
  clicksByOS: Record<string, number>;

  @ApiProperty({
    description: 'Clicks by date',
  })
  clicksByDate: Record<string, number>;

  @ApiProperty({
    description: 'Clicks by referrer',
  })
  clicksByReferrer: Record<string, number>;
}

export class BulkUrlResponseDto {
  @ApiProperty({ description: 'Number of successfully created URLs' })
  successCount: number;

  @ApiProperty({ description: 'Number of URLs that failed to create' })
  errorCount: number;

  @ApiProperty({
    description: 'Successfully created URLs',
    type: [Object],
  })
  successfulUrls: any[];

  @ApiProperty({
    description: 'Errors that occurred during creation',
    type: [Object],
  })
  errors: Array<{ url: string; error: string }>;
}