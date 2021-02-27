export interface IPaginatorParams {
  limit: number;
  initTimestamp?: number;
  offset: number;
}

export interface IPaginatorResult<Entity> {
  data: Entity[];
  pageMeta: IPaginatorPageMeta;
}

export interface IPaginatorPageMeta {
  hasMore: boolean;
}

export interface IPaginatorPaginateOptions {
  paginationParams: IPaginatorParams;
  rewriteWhere?: boolean;
}
