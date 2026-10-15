export const API_BASE_URL = '/api';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`API request failed with status ${status}`);
    this.status = status;
  }
}

// `acceptedStatuses` covers endpoints whose error status still carries a typed body, such as health's 503.
export async function getJson<T>(
  path: string,
  acceptedStatuses: readonly number[] = [],
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok && !acceptedStatuses.includes(response.status)) {
    throw new ApiError(response.status);
  }
  return (await response.json()) as T;
}
