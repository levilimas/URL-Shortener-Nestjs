import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PgBoss from 'pg-boss';
import { AnalyticsService } from '../modules/analytics/analytics.service';
import { CLICK_ANALYTICS_QUEUE } from './queue.constants';
import type { ClickAnalyticsJobPayload } from '../../application/dtos/url/click-request-snapshot.dto';

function buildPostgresConnectionString(config: ConfigService): string {
  const user = config.get<string>('DB_USERNAME', 'postgres');
  const password = encodeURIComponent(
    config.get<string>('DB_PASSWORD', 'postgres'),
  );
  const host = config.get<string>('DB_HOST', 'localhost');
  const port = config.get<string>('DB_PORT', '5432');
  const database = config.get<string>('DB_DATABASE', 'url_shortener');
  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

@Injectable()
export class PgBossService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PgBossService.name);
  private boss: PgBoss | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  isEnabled(): boolean {
    return (
      this.configService.get<string>('PGBOSS_ENABLED', 'true') === 'true'
    );
  }

  async onModuleInit(): Promise<void> {
    if (!this.isEnabled()) {
      this.logger.log('PgBoss disabled (PGBOSS_ENABLED!=true)');
      return;
    }
    const connectionString =
      this.configService.get<string>('DATABASE_URL') ||
      buildPostgresConnectionString(this.configService);
    this.boss = new PgBoss({ connectionString });
    try {
      await this.boss.start();
      await this.boss.createQueue(CLICK_ANALYTICS_QUEUE);
      await this.boss.work(
        CLICK_ANALYTICS_QUEUE,
        async (jobs) => {
          for (const job of jobs) {
            const { urlId, snapshot } = job.data as ClickAnalyticsJobPayload;
            await this.analyticsService.recordClickFromSnapshot(
              urlId,
              snapshot,
            );
          }
        },
      );
      this.logger.log(`PgBoss worker registered: ${CLICK_ANALYTICS_QUEUE}`);
    } catch (e) {
      const err = e as Error;
      this.logger.error(
        `PgBoss failed to start; falling back to sync analytics: ${err.message}`,
        err.stack,
      );
      try {
        await this.boss.stop({ timeout: 3000 });
      } catch {
        /* ignore */
      }
      this.boss = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.boss) {
      await this.boss.stop({ timeout: 10000, graceful: true });
      this.boss = null;
    }
  }

  async enqueueClickAnalytics(payload: ClickAnalyticsJobPayload): Promise<void> {
    if (!this.boss) {
      await this.analyticsService.recordClickFromSnapshot(
        payload.urlId,
        payload.snapshot,
      );
      return;
    }
    await this.boss.send(CLICK_ANALYTICS_QUEUE, payload);
  }
}
