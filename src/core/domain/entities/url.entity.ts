import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

@Entity('urls')
export class UrlEntity extends BaseEntity {
  @Column({ name: 'original_url' })
  originalUrl: string;

  @Column({ unique: true })
  shortCode: string;

  @Column({ default: 0 })
  clicks: number;

  @ManyToOne(() => UserEntity, (user) => user.urls, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @Column({ name: 'user_id', nullable: true })
  userId?: string;
}