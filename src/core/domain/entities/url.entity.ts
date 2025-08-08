import { 
  Entity, 
  Column, 
  ManyToOne, 
  JoinColumn,
  OneToMany 
} from 'typeorm';

import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';
import { ClickAnalyticsEntity } from './click-analytics.entity';

@Entity('urls')
export class UrlEntity extends BaseEntity {
  @Column({ name: 'original_url' })
  originalUrl: string;

  @Column({ unique: true })
  shortCode: string;

  @Column({ default: 0 })
  clicks: number;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_custom_code', default: false })
  isCustomCode: boolean;

  @Column({ name: 'qr_code_url', nullable: true })
  qrCodeUrl?: string;

  @Column({ name: 'password', nullable: true })
  password?: string;

  @Column({ name: 'max_clicks', nullable: true })
  maxClicks?: number;

  @ManyToOne(() => UserEntity, (user) => user.urls, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @Column({ name: 'user_id', nullable: true })
  userId?: string;

  @OneToMany(() => ClickAnalyticsEntity, (analytics) => analytics.url)
  analytics: ClickAnalyticsEntity[];

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  hasReachedMaxClicks(): boolean {
    return false;
  }

  isAccessible(): boolean {
    return this.isActive && !this.isExpired() && !this.hasReachedMaxClicks();
  }
}