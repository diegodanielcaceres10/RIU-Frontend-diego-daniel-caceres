export type PaginationSortDirection = 'asc' | 'desc';
export type SortBy = 'name' | 'created_at';

export interface SuperHero {
  id: number;
  license_id: number;
  name: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}
