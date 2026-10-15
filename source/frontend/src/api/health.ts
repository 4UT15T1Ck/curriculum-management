import { getJson } from './client';
import type { components } from './schema';

export type Health = components['schemas']['HealthDto'];
export type DependencyStatus = Health['database'];

const HEALTH_PATH = '/health';
const SERVICE_UNAVAILABLE = 503;

export const healthQueryKey = ['health'] as const;

export function fetchHealth(): Promise<Health> {
  return getJson<Health>(HEALTH_PATH, [SERVICE_UNAVAILABLE]);
}
