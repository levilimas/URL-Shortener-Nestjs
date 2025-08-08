import { Module } from '@nestjs/common';
// import { TerminusModule } from '@nestjs/terminus';
// import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlEntity } from '../../../core/domain/entities/url.entity';

@Module({
  imports: [
    // TerminusModule,
    // PrometheusModule.register(),
    TypeOrmModule.forFeature([UrlEntity]),
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}