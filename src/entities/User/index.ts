import { Column, Entity } from 'typeorm';

import { BaseEnity } from '@/entities/BaseEntity';

@Entity()
export class User extends BaseEnity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}
