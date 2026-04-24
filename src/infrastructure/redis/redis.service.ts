import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;

  constructor(private readonly configService: ConfigService) {}

  isEnabled(): boolean {
    return this.configService.get<string>('REDIS_ENABLED', 'false') === 'true';
  }

  isReady(): boolean {
    return this.client?.status === 'ready';
  }

  async onModuleInit(): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }
    const host = this.configService.get<string>('REDIS_HOST', '127.0.0.1');
    const port = parseInt(
      this.configService.get<string>('REDIS_PORT', '6379'),
      10,
    );
    const password = this.configService.get<string>('REDIS_PASSWORD', '');
    this.client = new Redis({
      host,
      port,
      password: password || undefined,
      maxRetriesPerRequest: 2,
      lazyConnect: true,
    });
    this.client.on('error', (err) => {
      this.logger.warn(`Redis: ${err.message}`);
    });
    try {
      await this.client.connect();
    } catch (e) {
      const err = e as Error;
      this.logger.warn(
        `Redis connection failed; continuing without cache: ${err.message}`,
      );
      await this.client.quit().catch(() => undefined);
      this.client = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit().catch(() => undefined);
      this.client = null;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isReady()) {
      return null;
    }
    return this.client!.get(key);
  }

  async setex(key: string, seconds: number, value: string): Promise<void> {
    if (!this.isReady()) {
      return;
    }
    await this.client!.setex(key, seconds, value);
  }

  async del(key: string): Promise<void> {
    if (!this.isReady()) {
      return;
    }
    await this.client!.del(key);
  }
}
