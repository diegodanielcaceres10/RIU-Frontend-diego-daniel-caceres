export type PaginationSortDirection = 'asc' | 'desc';
export type SortBy = 'name' | 'created_at';

export interface SuperHero {
  id: number;
  name: string;
  power: string;
  publisher: string;
}
