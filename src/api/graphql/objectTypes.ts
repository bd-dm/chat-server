import { Field, ObjectType } from 'type-graphql';

import { IPaginatorPageMeta } from '@/definitions/pagination';

@ObjectType()
export class PaginatedPageMeta implements IPaginatorPageMeta {
  @Field()
  hasMore: boolean;
}
