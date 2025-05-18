/**
 * Common types used across multiple functions
 */

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SortParams {
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface FilterParams {
  [key: string]: string | number | boolean | null;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
