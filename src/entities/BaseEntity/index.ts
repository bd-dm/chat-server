import {
  Field,
  ID,
  ObjectType,
} from 'type-graphql';
import {
  BaseEntity as OrmBaseEntity, Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
export abstract class BaseEntityId extends OrmBaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;
}

@ObjectType()
export abstract class BaseEntity extends BaseEntityId {
  @Field(() => Date)
  @CreateDateColumn({ update: false })
  createdAt: string | Date;

  @Field(() => Date)
  @UpdateDateColumn({ update: false })
  updatedAt: string | Date;
}

@ObjectType()
export abstract class PaginatedEntity extends BaseEntity {
  @Field()
  @Column({ generated: 'increment' })
  serial: number;
}
