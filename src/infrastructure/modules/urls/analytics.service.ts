import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClickAnalyticsEntity } from '../../../core/domain/entities/click-analytics.entity';
import { UrlEntity } from '../../../core/domain/entities/url.entity';
import { UrlAnalyticsDto, ClickAnalyticsDto } from '../../../application/dtos/url/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(ClickAnalyticsEntity)
    private clickAnalyticsRepository: Repository<ClickAnalyticsEntity>,
    @InjectRepository(UrlEntity)
    private urlRepository: Repository<UrlEntity>,
  ) {}

  /**
   * Record a click event with detailed analytics
   */
  async recordClick(
    urlId: string,
    request: any,
  ): Promise<ClickAnalyticsEntity> {
    const userAgent = request.headers['user-agent'] || '';
    const ipAddress = this.getClientIp(request);
    const referer = request.headers.referer || request.headers.referrer;

    const deviceInfo = this.parseUserAgent(userAgent);
    const utmParams = this.extractUtmParameters(referer);
    const geoInfo = await this.getGeoLocation(ipAddress);

    const clickAnalytics = this.clickAnalyticsRepository.create({
      urlId,
      ipAddress: this.getClientIp(request),
      userAgent: request.headers['user-agent'] || '',
      country: this.extractCountryFromIp(this.getClientIp(request)),
      city: this.extractCityFromIp(this.getClientIp(request)),
      device: this.extractDeviceInfo(request.headers['user-agent'] || ''),
      browser: this.extractBrowserInfo(request.headers['user-agent'] || ''),
      operatingSystem: this.extractOSInfo(request.headers['user-agent'] || ''),
      referer: request.headers.referer || null,
      utmSource: request.query?.utm_source as string || null,
      utmMedium: request.query?.utm_medium as string || null,
      utmCampaign: request.query?.utm_campaign as string || null,
      utmTerm: request.query?.utm_term as string || null,
      utmContent: request.query?.utm_content as string || null,
      isMobile: this.isMobileDevice(request.headers['user-agent'] || ''),
      isBot: this.isBotUserAgent(request.headers['user-agent'] || ''),
    });

    return this.clickAnalyticsRepository.save(clickAnalytics);
  }

  /**
   * Extract country from IP address
   */
  private extractCountryFromIp(ip: string): string {
    // Placeholder - in production, use a GeoIP service
    if (ip === '127.0.0.1' || ip.startsWith('192.168.')) {
      return 'Local';
    }
    return 'Unknown';
  }

  /**
   * Extract city from IP address
   */
  private extractCityFromIp(ip: string): string {
    // Placeholder - in production, use a GeoIP service
    if (ip === '127.0.0.1' || ip.startsWith('192.168.')) {
      return 'Local';
    }
    return 'Unknown';
  }

  /**
   * Extract device information from user agent
   */
  private extractDeviceInfo(userAgent: string): string {
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      return 'Mobile';
    } else if (/Tablet/.test(userAgent)) {
      return 'Tablet';
    }
    return 'Desktop';
  }

  /**
   * Extract browser information from user agent
   */
  private extractBrowserInfo(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  /**
   * Extract operating system information from user agent
   */
  private extractOSInfo(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  /**
   * Check if device is mobile
   */
  private isMobileDevice(userAgent: string): boolean {
    return /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  }

  /**
   * Check if user agent is a bot
   */
  private isBotUserAgent(userAgent: string): boolean {
    return /bot|crawler|spider|crawling/i.test(userAgent);
  }

  /**
   * Get analytics for a specific URL
   */
  async getUrlAnalytics(
    urlId: string,
    days: number = 30,
  ): Promise<UrlAnalyticsDto> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const clicks = await this.clickAnalyticsRepository.find({
      where: {
        urlId,
        createdAt: {
          $gte: startDate,
        } as any,
      },
      order: { createdAt: 'DESC' },
    });

    const totalClicks = clicks.length;
    const uniqueClicks = clicks.filter(click => !click.isBot).length;
    const botClicks = clicks.filter(click => click.isBot).length;
    const mobileClicks = clicks.filter(click => click.isMobile).length;
    const desktopClicks = totalClicks - mobileClicks;

    // Group by various dimensions
    const clicksByCountry = this.groupBy(clicks, 'country');
    const clicksByBrowser = this.groupBy(clicks, 'browser');
    const clicksByOS = this.groupBy(clicks, 'operatingSystem');
    const clicksByReferrer = this.groupByReferrer(clicks);
    const clicksByDate = this.groupByDate(clicks);

    // Get recent clicks (last 10)
    const recentClicks = clicks.slice(0, 10).map(click => ({
      id: click.id,
      createdAt: click.createdAt,
      country: click.country,
      city: click.city,
      region: click.region,
      device: click.device,
      browser: click.browser,
      operatingSystem: click.operatingSystem,
      isMobile: click.isMobile,
      isBot: click.isBot,
      referer: click.referer,
      language: click.language,
      utmSource: click.utmSource,
      utmMedium: click.utmMedium,
      utmCampaign: click.utmCampaign,
    }));

    return {
      totalClicks,
      uniqueClicks,
      botClicks,
      mobileClicks,
      desktopClicks,
      recentClicks,
      clicksByCountry,
      clicksByBrowser,
      clicksByOS,
      clicksByDate,
      clicksByReferrer,
    };
  }

  /**
   * Get analytics for all URLs of a user
   */
  async getUserAnalytics(userId: string, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const userUrls = await this.urlRepository.find({
      where: { userId },
      relations: ['analytics'],
    });

    const totalUrls = userUrls.length;
    const totalClicks = userUrls.reduce((sum, url) => sum + url.clicks, 0);

    // Get top performing URLs
    const topUrls = userUrls
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)
      .map(url => ({
        id: url.id,
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        clicks: url.clicks,
        description: url.description,
      }));

    return {
      totalUrls,
      totalClicks,
      topUrls,
      period: `${days} days`,
    };
  }

  /**
   * Extract client IP address
   */
  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      '127.0.0.1'
    );
  }

  /**
   * Parse user agent string
   */
  private parseUserAgent(userAgent: string): any {
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isBot = /bot|crawler|spider|crawling/i.test(userAgent);
    
    let browser = 'Unknown';
    let os = 'Unknown';
    let device = isMobile ? 'Mobile' : 'Desktop';

    // Simple browser detection
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // Simple OS detection
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    return { browser, os, device, isMobile, isBot };
  }

  /**
   * Extract UTM parameters from URL
   */
  private extractUtmParameters(url: string): any {
    const urlObj = new URL(url, 'http://localhost');
    return {
      utmSource: urlObj.searchParams.get('utm_source'),
      utmMedium: urlObj.searchParams.get('utm_medium'),
      utmCampaign: urlObj.searchParams.get('utm_campaign'),
      utmTerm: urlObj.searchParams.get('utm_term'),
      utmContent: urlObj.searchParams.get('utm_content'),
    };
  }

  /**
   * Get geo location from IP (simplified)
   */
  private async getGeoLocation(ipAddress: string): Promise<{ country?: string; city?: string }> {
    if (!ipAddress || ipAddress === '127.0.0.1' || ipAddress === '::1') {
      return { country: 'Local', city: 'Local' };
    }
    
    try {
      return { country: 'Unknown', city: 'Unknown' };
    } catch (error) {
      return { country: 'Unknown', city: 'Unknown' };
    }
  }

  /**
   * Group array by field
   */
  private groupBy(array: any[], field: string): Record<string, number> {
    return array.reduce((acc, item) => {
      const key = item[field] || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Group by referrer domain
   */
  private groupByReferrer(clicks: ClickAnalyticsEntity[]): Record<string, number> {
    return clicks.reduce((acc, click) => {
      let referrer = 'Direct';
      if (click.referer) {
        try {
          const url = new URL(click.referer);
          referrer = url.hostname;
        } catch {
          referrer = 'Unknown';
        }
      }
      acc[referrer] = (acc[referrer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Group by date
   */
  private groupByDate(clicks: ClickAnalyticsEntity[]): Record<string, number> {
    return clicks.reduce((acc, click) => {
      const date = click.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}