import { Field, InputType } from 'type-graphql';

import { IPaginatorParams } from '@/definitions/pagination';

@InputType()
export class PaginatedInput implements IPaginatorParams {
  @Field({ nullable: true })
  initTimestamp?: number;

  @Field()
  offset: number;

  @Field()
  limit: number;
}
