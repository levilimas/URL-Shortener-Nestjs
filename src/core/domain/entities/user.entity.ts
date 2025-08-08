import { Entity, Column, OneToMany, BeforeInsert } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UrlEntity } from './url.entity';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';


@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  name: string;

  @OneToMany(() => UrlEntity, url => url.user)
  urls: UrlEntity[];

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}