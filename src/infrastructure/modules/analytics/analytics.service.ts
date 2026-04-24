import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { ClickAnalyticsEntity } from '../../../domain/entities/click-analytics.entity';
import { UrlEntity } from '../../../domain/entities/url.entity';
import { UrlAnalyticsDto } from '../../../application/dtos/url/analytics.dto';
import type { ClickRequestSnapshot } from '../../../application/dtos/url/click-request-snapshot.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(ClickAnalyticsEntity)
    private clickAnalyticsRepository: Repository<ClickAnalyticsEntity>,
    @InjectRepository(UrlEntity)
    private urlRepository: Repository<UrlEntity>,
  ) {}

  buildClickSnapshot(request: any): ClickRequestSnapshot {
    const userAgent = (request.headers?.['user-agent'] as string) || '';
    return {
      ipAddress: this.getClientIp(request),
      userAgent,
      referer:
        (request.headers?.referer as string) ||
        (request.headers?.referrer as string) ||
        null,
      utmSource: (request.query?.utm_source as string) || null,
      utmMedium: (request.query?.utm_medium as string) || null,
      utmCampaign: (request.query?.utm_campaign as string) || null,
      utmTerm: (request.query?.utm_term as string) || null,
      utmContent: (request.query?.utm_content as string) || null,
    };
  }

  async recordClick(
    urlId: string,
    request: any,
  ): Promise<ClickAnalyticsEntity> {
    return this.recordClickFromSnapshot(urlId, this.buildClickSnapshot(request));
  }

  async recordClickFromSnapshot(
    urlId: string,
    snapshot: ClickRequestSnapshot,
  ): Promise<ClickAnalyticsEntity> {
    const userAgent = snapshot.userAgent;
    const ipAddress = snapshot.ipAddress;

    const clickAnalytics = this.clickAnalyticsRepository.create({
      urlId,
      ipAddress,
      userAgent,
      country: this.extractCountryFromIp(ipAddress),
      city: this.extractCityFromIp(ipAddress),
      device: this.extractDeviceInfo(userAgent),
      browser: this.extractBrowserInfo(userAgent),
      operatingSystem: this.extractOSInfo(userAgent),
      referer: snapshot.referer,
      utmSource: snapshot.utmSource,
      utmMedium: snapshot.utmMedium,
      utmCampaign: snapshot.utmCampaign,
      utmTerm: snapshot.utmTerm,
      utmContent: snapshot.utmContent,
      isMobile: this.isMobileDevice(userAgent),
      isBot: this.isBotUserAgent(userAgent),
    });

    return this.clickAnalyticsRepository.save(clickAnalytics);
  }

  private extractCountryFromIp(ip: string): string {
    if (ip === '127.0.0.1' || ip.startsWith('192.168.')) {
      return 'Local';
    }
    return 'Unknown';
  }

  private extractCityFromIp(ip: string): string {
    if (ip === '127.0.0.1' || ip.startsWith('192.168.')) {
      return 'Local';
    }
    return 'Unknown';
  }

  private extractDeviceInfo(userAgent: string): string {
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      return 'Mobile';
    }
    if (/Tablet/.test(userAgent)) {
      return 'Tablet';
    }
    return 'Desktop';
  }

  private extractBrowserInfo(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  private extractOSInfo(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private isMobileDevice(userAgent: string): boolean {
    return /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent,
    );
  }

  private isBotUserAgent(userAgent: string): boolean {
    return /bot|crawler|spider|crawling/i.test(userAgent);
  }

  async getUrlAnalytics(
    urlId: string,
    days: number = 30,
  ): Promise<UrlAnalyticsDto> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const clicks = await this.clickAnalyticsRepository.find({
      where: {
        urlId,
        createdAt: MoreThanOrEqual(startDate),
      },
      order: { createdAt: 'DESC' },
    });

    const totalClicks = clicks.length;
    const uniqueClicks = clicks.filter((click) => !click.isBot).length;
    const botClicks = clicks.filter((click) => click.isBot).length;
    const mobileClicks = clicks.filter((click) => click.isMobile).length;
    const desktopClicks = totalClicks - mobileClicks;

    const clicksByCountry = this.groupBy(clicks, 'country');
    const clicksByBrowser = this.groupBy(clicks, 'browser');
    const clicksByOS = this.groupBy(clicks, 'operatingSystem');
    const clicksByReferrer = this.groupByReferrer(clicks);
    const clicksByDate = this.groupByDate(clicks);

    const recentClicks = clicks.slice(0, 10).map((click) => ({
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

  async getUserAnalytics(userId: string, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const userUrls = await this.urlRepository.find({
      where: { userId },
      relations: ['analytics'],
    });

    const totalUrls = userUrls.length;
    const totalClicks = userUrls.reduce((sum, url) => sum + url.clicks, 0);

    const topUrls = userUrls
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)
      .map((url) => ({
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

  private getClientIp(request: any): string {
    return (
      request.headers?.['x-forwarded-for']?.split(',')[0] ||
      request.headers?.['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      '127.0.0.1'
    );
  }

  private groupBy(array: any[], field: string): Record<string, number> {
    return array.reduce((acc, item) => {
      const key = item[field] || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  private groupByReferrer(
    clicks: ClickAnalyticsEntity[],
  ): Record<string, number> {
    return clicks.reduce(
      (acc, click) => {
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
      },
      {} as Record<string, number>,
    );
  }

  private groupByDate(clicks: ClickAnalyticsEntity[]): Record<string, number> {
    return clicks.reduce(
      (acc, click) => {
        const date = click.createdAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}
