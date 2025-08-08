import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './infrastructure/modules/auth/auth.module';
import { UrlsModule } from './infrastructure/modules/urls/urls.module';
import { HealthModule } from './infrastructure/modules/health/health.module';
import databaseConfig from './infrastructure/config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    DatabaseModule,
    AuthModule,
    UrlsModule,
    HealthModule,
  ],
})
export class AppModule {}