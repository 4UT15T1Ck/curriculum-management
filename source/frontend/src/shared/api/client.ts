import type { components } from './schema';

export const API_BASE_URL = '/api';

type QueryScalar = string | number | boolean | null | undefined;
// An array becomes a repeated key (`status=A&status=B`), the form the server's list filters read.
type QueryValue = QueryScalar | readonly QueryScalar[];

export function withQuery(
  path: string,
  params: Record<string, QueryValue>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const entry of Array.isArray(value) ? value : [value]) {
      if (entry !== undefined && entry !== null && entry !== '') {
        search.append(key, String(entry));
      }
    }
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

type ErrorResponse = components['schemas']['ErrorResponseDto'];
type FieldError = components['schemas']['FieldErrorDto'];

const NO_CONTENT = 204;
const CSRF_HEADER = { 'X-Requested-With': 'XMLHttpRequest' } as const;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly details: FieldError[] | undefined;

  constructor(status: number, body: Partial<ErrorResponse> | undefined) {
    super(body?.message ?? `API request failed with status ${status}`);
    this.status = status;
    this.code = body?.code;
    this.details = body?.details;
  }
}

async function request<T>(
  path: string,
  init: RequestInit,
  acceptedStatuses: readonly number[],
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { Accept: 'application/json', ...CSRF_HEADER, ...init.headers },
  });
  if (!response.ok && !acceptedStatuses.includes(response.status)) {
    throw new ApiError(response.status, await readErrorBody(response));
  }
  if (response.status === NO_CONTENT) return undefined as T;
  return (await response.json()) as T;
}

async function readErrorBody(
  response: Response,
): Promise<Partial<ErrorResponse> | undefined> {
  try {
    return (await response.json()) as Partial<ErrorResponse>;
  } catch {
    return undefined;
  }
}

export function getJson<T>(
  path: string,
  acceptedStatuses: readonly number[] = [],
): Promise<T> {
  return request<T>(path, { method: 'GET' }, acceptedStatuses);
}

export function sendJson<T>(
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  return request<T>(
    path,
    {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
    [],
  );
}
