/** Standard success envelope (ApiResponse trait) */
export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

/** Paginated list response */
export type ApiPaginated<TItem> = {
  success: true;
  data: TItem[];
  meta: ApiMeta;
};

export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

export type LaravelValidationError = {
  message: string;
  errors?: Record<string, string[]>;
};

export function isApiErrorBody(x: unknown): x is ApiErrorBody {
  return (
    typeof x === 'object' &&
    x !== null &&
    'success' in x &&
    (x as ApiErrorBody).success === false
  );
}
