import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlsController } from './urls.controller';
import { RedirectController } from './redirect.controller';
import { UrlsService } from './urls.service';
import { QrCodeService } from './qr-code.service';
import { AnalyticsService } from './analytics.service';
import { UrlEntity } from '../../../domain/entities/url.entity';
import { ClickAnalyticsEntity } from '../../../domain/entities/click-analytics.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([UrlEntity, ClickAnalyticsEntity]),
    ConfigModule,
  ],
  controllers: [UrlsController, RedirectController],
  providers: [UrlsService, QrCodeService, AnalyticsService],
  exports: [UrlsService, QrCodeService, AnalyticsService],
})
export class UrlsModule {}
