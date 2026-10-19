import type { PageQueryDto } from './page-query.dto.js';

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function toSkipTake(query: PageQueryDto): {
  skip: number;
  take: number;
} {
  return { skip: (query.page - 1) * query.pageSize, take: query.pageSize };
}

export function toPage<T>(
  items: T[],
  total: number,
  query: PageQueryDto,
): Page<T> {
  return { items, total, page: query.page, pageSize: query.pageSize };
}
