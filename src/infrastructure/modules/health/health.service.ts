import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UrlEntity } from '../../../core/domain/entities/url.entity';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(UrlEntity)
    private urlRepository: Repository<UrlEntity>,
  ) {}

  async checkDatabase(): Promise<boolean> {
    try {
      await this.urlRepository.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }

  getStatus() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
    };
  }
}