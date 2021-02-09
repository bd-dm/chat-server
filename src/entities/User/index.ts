import { Field, ObjectType } from 'type-graphql';
import { Column, Entity } from 'typeorm';

import { BaseEnity } from '@/entities/BaseEntity';

@ObjectType()
@Entity()
export class User extends BaseEnity {
  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}
