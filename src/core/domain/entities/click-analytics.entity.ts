import { 
  Entity, 
  Column, 
  ManyToOne, 
  JoinColumn,
  Index
} from 'typeorm';

import { BaseEntity } from './base.entity';
import { UrlEntity } from './url.entity';

@Entity('click_analytics')
@Index(['urlId', 'createdAt'])
export class ClickAnalyticsEntity extends BaseEntity {
  @ManyToOne(() => UrlEntity, (url) => url.analytics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'url_id' })
  url: UrlEntity;

  @Column({ name: 'url_id' })
  urlId: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  referer?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  region?: string;

  @Column({ nullable: true })
  device?: string;

  @Column({ nullable: true })
  browser?: string;

  @Column({ name: 'operating_system', nullable: true })
  operatingSystem?: string;

  @Column({ name: 'is_mobile', default: false })
  isMobile: boolean;

  @Column({ name: 'is_bot', default: false })
  isBot: boolean;

  @Column({ nullable: true })
  language?: string;

  @Column({ name: 'screen_resolution', nullable: true })
  screenResolution?: string;

  @Column({ name: 'utm_source', nullable: true })
  utmSource?: string;

  @Column({ name: 'utm_medium', nullable: true })
  utmMedium?: string;

  @Column({ name: 'utm_campaign', nullable: true })
  utmCampaign?: string;

  @Column({ name: 'utm_term', nullable: true })
  utmTerm?: string;

  @Column({ name: 'utm_content', nullable: true })
  utmContent?: string;
}