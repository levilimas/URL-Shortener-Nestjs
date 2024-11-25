import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { HealthModule } from './infrastructure/modules/health/health.module';
import { AuthModule } from './infrastructure/modules/auth/auth.module';
import { UrlsModule } from './infrastructure/modules/urls/urls.module';
import { loggerConfig } from './infrastructure/config/logger.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WinstonModule.forRoot(loggerConfig),
    PrometheusModule.register(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'development',
    }),
    HealthModule,
    AuthModule,
    UrlsModule,
  ],
})
export class AppModule {}