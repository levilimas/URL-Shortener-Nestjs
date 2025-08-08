import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClickAnalyticsDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier for the click event',
  })
  id: string;

  @ApiProperty({
    example: '2023-12-01T10:00:00.000Z',
    description: 'When the click occurred',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    example: 'United States',
    description: 'Country where the click originated',
  })
  country?: string;

  @ApiPropertyOptional({
    example: 'New York',
    description: 'City where the click originated',
  })
  city?: string;

  @ApiPropertyOptional({
    example: 'New York',
    description: 'Region/state where the click originated',
  })
  region?: string;

  @ApiPropertyOptional({
    example: 'Desktop',
    description: 'Device type used for the click',
  })
  device?: string;

  @ApiPropertyOptional({
    example: 'Chrome',
    description: 'Browser used for the click',
  })
  browser?: string;

  @ApiPropertyOptional({
    example: 'Windows',
    description: 'Operating system used for the click',
  })
  operatingSystem?: string;

  @ApiProperty({
    example: false,
    description: 'Whether the click came from a mobile device',
  })
  isMobile: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether the click came from a bot',
  })
  isBot: boolean;

  @ApiPropertyOptional({
    example: 'https://google.com',
    description: 'Referrer URL',
  })
  referer?: string;

  @ApiPropertyOptional({
    example: 'en-US',
    description: 'Language preference',
  })
  language?: string;

  @ApiPropertyOptional({
    example: 'google',
    description: 'UTM source parameter',
  })
  utmSource?: string;

  @ApiPropertyOptional({
    example: 'cpc',
    description: 'UTM medium parameter',
  })
  utmMedium?: string;

  @ApiPropertyOptional({
    example: 'summer_sale',
    description: 'UTM campaign parameter',
  })
  utmCampaign?: string;
}

export class UrlAnalyticsDto {
  @ApiProperty({
    example: 150,
    description: 'Total number of clicks',
  })
  totalClicks: number;

  @ApiProperty({
    example: 120,
    description: 'Number of unique clicks (excluding bots)',
  })
  uniqueClicks: number;

  @ApiProperty({
    example: 30,
    description: 'Number of bot clicks',
  })
  botClicks: number;

  @ApiProperty({
    example: 75,
    description: 'Number of mobile clicks',
  })
  mobileClicks: number;

  @ApiProperty({
    example: 75,
    description: 'Number of desktop clicks',
  })
  desktopClicks: number;

  @ApiProperty({
    type: [ClickAnalyticsDto],
    description: 'Recent click events',
  })
  recentClicks: ClickAnalyticsDto[];

  @ApiProperty({
    example: {
      'United States': 80,
      'Canada': 30,
      'United Kingdom': 25,
      'Germany': 15,
    },
    description: 'Clicks by country',
  })
  clicksByCountry: Record<string, number>;

  @ApiProperty({
    example: {
      'Chrome': 90,
      'Firefox': 35,
      'Safari': 20,
      'Edge': 5,
    },
    description: 'Clicks by browser',
  })
  clicksByBrowser: Record<string, number>;

  @ApiProperty({
    example: {
      'Windows': 80,
      'macOS': 40,
      'Linux': 20,
      'iOS': 10,
    },
    description: 'Clicks by operating system',
  })
  clicksByOS: Record<string, number>;

  @ApiProperty({
    example: {
      '2023-12-01': 25,
      '2023-12-02': 30,
      '2023-12-03': 45,
      '2023-12-04': 50,
    },
    description: 'Clicks by date',
  })
  clicksByDate: Record<string, number>;

  @ApiProperty({
    example: {
      'google': 60,
      'facebook': 40,
      'twitter': 25,
      'direct': 25,
    },
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