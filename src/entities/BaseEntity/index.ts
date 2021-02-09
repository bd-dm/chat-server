import {
  Field,
  ID,
  ObjectType,
} from 'type-graphql';
import {
  BaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
export abstract class BaseEnity extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @CreateDateColumn({ update: false })
  createdAt: string | Date;

  @Field(() => String)
  @UpdateDateColumn({ update: false })
  updatedAt: string | Date;
}
