import { Global, Module } from '@nestjs/common';
import { AnalyticsModule } from '../modules/analytics/analytics.module';
import { PgBossService } from './pg-boss.service';

@Global()
@Module({
  imports: [AnalyticsModule],
  providers: [PgBossService],
  exports: [PgBossService],
})
export class QueueModule {}
