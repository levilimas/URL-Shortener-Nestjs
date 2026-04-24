import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UrlsController } from './urls.controller';
import { RedirectController } from './redirect.controller';
import { UrlsService } from './urls.service';
import { QrCodeService } from './qr-code.service';
import { UrlEntity } from '../../../domain/entities/url.entity';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UrlEntity]),
    ConfigModule,
    AnalyticsModule,
  ],
  controllers: [UrlsController, RedirectController],
  providers: [UrlsService, QrCodeService],
  exports: [UrlsService, QrCodeService, AnalyticsModule],
})
export class UrlsModule {}
