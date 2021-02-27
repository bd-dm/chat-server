import { Brackets, LessThan, SelectQueryBuilder } from 'typeorm';

import { IPaginatorPaginateOptions, IPaginatorResult } from '@/definitions/pagination';

export class Paginator<T> {
  private readonly builder: SelectQueryBuilder<T>;

  constructor(builder: SelectQueryBuilder<T>) {
    this.builder = builder;
  }

  async paginate(options: IPaginatorPaginateOptions): Promise<IPaginatorResult<T>> {
    const {
      paginationParams,
      rewriteWhere = false,
    } = options;

    this.builder.limit(paginationParams.limit + 1);
    this.builder.offset(paginationParams.offset);

    if (paginationParams.initTimestamp) {
      const where = {
        createdAt: LessThan(new Date(paginationParams.initTimestamp)),
      };

      if (rewriteWhere) {
        this.builder.where(where);
      } else {
        this.builder.andWhere(new Brackets((qb) => qb.where(where)));
      }
    }

    const realData = await this.builder.getMany();

    let data = [...realData];
    const hasMore = realData.length > paginationParams.limit;
    if (hasMore) {
      data = data.slice(0, -1);
    }

    return {
      data,
      pageMeta: {
        hasMore,
      },
    };
  }
}
