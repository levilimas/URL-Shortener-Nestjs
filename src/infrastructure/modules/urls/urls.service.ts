// src/infrastructure/modules/urls/urls.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UrlEntity } from '../../../core/domain/entities/url.entity';
import { CreateUrlDto } from '../../../application/dtos/url/create-url.dto';
import { UpdateUrlDto } from '../../../application/dtos/url/update-url.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UrlsService {
  private generateShortCode: () => string;

  constructor(
    @InjectRepository(UrlEntity)
    private urlRepository: Repository<UrlEntity>,
    private configService: ConfigService,
  ) {
    this.initializeNanoid();
  }

  private async initializeNanoid() {
    const nanoid = await import('nanoid');
    this.generateShortCode = nanoid.customAlphabet(
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      6
    );
  }

  async create(createUrlDto: CreateUrlDto, userId?: string): Promise<UrlEntity> {
    const shortCode = this.generateShortCode();
    
    const url = this.urlRepository.create({
      originalUrl: createUrlDto.originalUrl,
      shortCode,
      userId,
    });

    await this.urlRepository.save(url);
    return url;
  }

  async findAll(userId: string): Promise<UrlEntity[]> {
    return this.urlRepository.find({
      where: { userId, deletedAt: null },
      order: { createdAt: 'DESC' },
    });
  }

  async findByShortCode(shortCode: string): Promise<UrlEntity> {
    const url = await this.urlRepository.findOne({
      where: { shortCode, deletedAt: null },
    });

    if (!url) {
      throw new NotFoundException('URL not found');
    }

    return url;
  }

  async update(id: string, userId: string, updateUrlDto: UpdateUrlDto): Promise<UrlEntity> {
    const url = await this.urlRepository.findOne({
      where: { id, userId, deletedAt: null },
    });

    if (!url) {
      throw new NotFoundException('URL not found or not owned by user');
    }

    url.originalUrl = updateUrlDto.originalUrl;
    return this.urlRepository.save(url);
  }

  async delete(id: string, userId: string): Promise<void> {
    const url = await this.urlRepository.findOne({
      where: { id, userId, deletedAt: null },
    });

    if (!url) {
      throw new NotFoundException('URL not found or not owned by user');
    }

    url.deletedAt = new Date();
    await this.urlRepository.save(url);
  }

  async incrementClicks(shortCode: string): Promise<void> {
    await this.urlRepository.increment(
      { shortCode, deletedAt: null },
      'clicks',
      1
    );
  }

  getShortUrl(shortCode: string): string {
    const baseUrl = this.configService.get<string>('URL_PREFIX', 'http://localhost:3000');
    return `${baseUrl}/${shortCode}`;
  }
}