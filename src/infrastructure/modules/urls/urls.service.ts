import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UrlEntity } from '../../../domain/entities/url.entity';
import { CreateUrlDto } from '../../../application/dtos/url/create-url.dto';
import { UpdateUrlDto } from '../../../application/dtos/url/update-url.dto';
import { BulkCreateUrlDto } from '../../../application/dtos/url/bulk-create-url.dto';
import { ConfigService } from '@nestjs/config';
import { QrCodeService } from './qr-code.service';
import { AnalyticsService } from './analytics.service';
import { generateShortCode } from '../../../domain/services/short-code.generator';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UrlsService {
  constructor(
    @InjectRepository(UrlEntity)
    private urlRepository: Repository<UrlEntity>,
    private configService: ConfigService,
    private qrCodeService: QrCodeService,
    private analyticsService: AnalyticsService,
  ) {}

  async create(
    createUrlDto: CreateUrlDto,
    userId?: string,
  ): Promise<UrlEntity> {
    let shortCode: string;
    let isCustomCode = false;

    if (createUrlDto.customCode) {
      await this.validateCustomCode(createUrlDto.customCode);
      shortCode = createUrlDto.customCode;
      isCustomCode = true;
    } else {
      shortCode = await this.generateUniqueShortCode();
    }

    let hashedPassword: string | undefined;
    if (createUrlDto.password) {
      hashedPassword = await bcrypt.hash(createUrlDto.password, 10);
    }

    let expiresAt: Date | undefined;
    if (createUrlDto.expiresAt) {
      expiresAt = new Date(createUrlDto.expiresAt);
      if (expiresAt <= new Date()) {
        throw new BadRequestException('Expiration date must be in the future');
      }
    }

    const url = this.urlRepository.create({
      originalUrl: createUrlDto.originalUrl,
      shortCode,
      userId,
      description: createUrlDto.title,
      expiresAt,
      password: hashedPassword,
      maxClicks: createUrlDto.maxClicks,
      isCustomCode,
    });

    const savedUrl = await this.urlRepository.save(url);

    if (createUrlDto.generateQrCode) {
      const shortUrl = this.getShortUrl(savedUrl.shortCode);
      savedUrl.qrCodeUrl = this.qrCodeService.generateQrCodeUrl(shortUrl);
      await this.urlRepository.save(savedUrl);
    }

    return savedUrl;
  }

  async createBulk(
    bulkCreateUrlDto: BulkCreateUrlDto,
    userId?: string,
  ): Promise<any> {
    const results = {
      successCount: 0,
      errorCount: 0,
      successfulUrls: [] as UrlEntity[],
      errors: [] as Array<{ url: string; error: string }>,
    };

    for (const urlDto of bulkCreateUrlDto.urls) {
      try {
        const url = await this.create(urlDto, userId);
        results.successfulUrls.push(url);
        results.successCount++;
      } catch (error) {
        results.errors.push({
          url: urlDto.originalUrl,
          error: error.message,
        });
        results.errorCount++;
      }
    }

    return results;
  }

  async findAll(userId: string): Promise<UrlEntity[]> {
    return this.urlRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByShortCode(
    shortCode: string,
    password?: string,
  ): Promise<UrlEntity> {
    const url = await this.urlRepository.findOne({
      where: { shortCode },
    });

    if (!url) {
      throw new NotFoundException('URL not found');
    }

    if (!url.isAccessible()) {
      if (url.isExpired()) {
        throw new BadRequestException('URL has expired');
      }
      if (!url.isActive) {
        throw new BadRequestException('URL is not active');
      }
    }

    if (url.password) {
      if (!password) {
        throw new BadRequestException('Password required');
      }

      const isPasswordValid = await bcrypt.compare(password, url.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid password');
      }
    }

    return url;
  }

  async update(
    id: string,
    userId: string,
    updateUrlDto: UpdateUrlDto,
  ): Promise<UrlEntity> {
    const url = await this.urlRepository.findOne({
      where: { id, userId },
    });

    if (!url) {
      throw new NotFoundException('URL not found or not owned by user');
    }

    if (updateUrlDto.originalUrl) {
      url.originalUrl = updateUrlDto.originalUrl;
    }

    if (updateUrlDto.description !== undefined) {
      url.description = updateUrlDto.description;
    }

    if (updateUrlDto.isActive !== undefined) {
      url.isActive = updateUrlDto.isActive;
    }

    if (updateUrlDto.expiresAt !== undefined) {
      url.expiresAt = updateUrlDto.expiresAt
        ? new Date(updateUrlDto.expiresAt)
        : null;
    }

    return this.urlRepository.save(url);
  }

  async delete(id: string, userId: string): Promise<void> {
    const url = await this.urlRepository.findOne({
      where: { id, userId },
    });

    if (!url) {
      throw new NotFoundException('URL not found or not owned by user');
    }

    await this.urlRepository.softRemove(url);
  }

  async incrementClicks(shortCode: string, request?: any): Promise<void> {
    const url = await this.urlRepository.findOne({
      where: { shortCode },
    });

    if (url) {
      if (request) {
        await this.analyticsService.recordClick(url.id, request);
      }

      await this.urlRepository.increment({ id: url.id }, 'clicks', 1);
    }
  }

  async getAnalytics(
    id: string,
    userId: string,
    days: number = 30,
  ): Promise<any> {
    const url = await this.urlRepository.findOne({
      where: { id, userId },
    });

    if (!url) {
      throw new NotFoundException('URL not found or not owned by user');
    }

    return this.analyticsService.getUrlAnalytics(url.id, days);
  }

  async getUserAnalytics(userId: string, days: number = 30): Promise<any> {
    return this.analyticsService.getUserAnalytics(userId, days);
  }

  async generateQrCode(
    id: string,
    userId: string,
    options: any = {},
  ): Promise<string> {
    const url = await this.urlRepository.findOne({
      where: { id, userId },
    });

    if (!url) {
      throw new NotFoundException('URL not found or not owned by user');
    }

    const shortUrl = this.getShortUrl(url.shortCode);
    const qrCodeUrl = this.qrCodeService.generateStyledQrCodeUrl(
      shortUrl,
      options,
    );

    url.qrCodeUrl = qrCodeUrl;
    await this.urlRepository.save(url);

    return qrCodeUrl;
  }

  getShortUrl(shortCode: string): string {
    const baseUrl = this.configService.get<string>(
      'URL_PREFIX',
      'http://localhost:3000',
    );
    return `${baseUrl}/${shortCode}`;
  }

  private async validateCustomCode(customCode: string): Promise<void> {
    const existingUrl = await this.urlRepository.findOne({
      where: { shortCode: customCode },
    });

    if (existingUrl) {
      throw new ConflictException('Custom code is already taken');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(customCode)) {
      throw new BadRequestException(
        'Custom code can only contain letters, numbers, hyphens, and underscores',
      );
    }

    if (customCode.length < 3 || customCode.length > 20) {
      throw new BadRequestException(
        'Custom code must be between 3 and 20 characters',
      );
    }

    const reservedWords = [
      'api',
      'admin',
      'www',
      'app',
      'dashboard',
      'analytics',
      'qr',
    ];
    if (reservedWords.includes(customCode.toLowerCase())) {
      throw new BadRequestException('Custom code is reserved');
    }
  }

  private async generateUniqueShortCode(): Promise<string> {
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = generateShortCode();
      const existing = await this.urlRepository.findOne({
        where: { shortCode: code },
      });

      if (!existing) {
        return code;
      }

      attempts++;
    } while (attempts < maxAttempts);

    throw new Error('Unable to generate unique short code');
  }
}
