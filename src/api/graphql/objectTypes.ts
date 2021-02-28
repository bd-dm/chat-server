import { Field, ObjectType } from 'type-graphql';

import { IPaginatorPageMeta } from '@/definitions/pagination';

@ObjectType()
export class PaginatedPageMeta implements IPaginatorPageMeta {
  @Field()
  hasMore: boolean;
}

@ObjectType()
export class FileUri {
  @Field()
  id: string;

  @Field()
  uri: string;

  @Field({ nullable: true })
  mime?: string;
}
