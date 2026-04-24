import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClickAnalyticsEntity } from '../../../domain/entities/click-analytics.entity';
import { UrlEntity } from '../../../domain/entities/url.entity';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [TypeOrmModule.forFeature([ClickAnalyticsEntity, UrlEntity])],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
