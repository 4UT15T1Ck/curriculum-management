import { ROUTES } from '../../routes';
import type { components } from '../api/schema';

export interface RequestPrefill {
  type: components['schemas']['ChangeRequestType'];
  targetType: components['schemas']['ChangeTargetType'];
  targetId: string;
}

// One builder so every screen that offers "Tạo đề xuất" links to the form the same way.
export function requestFormLink({
  type,
  targetType,
  targetId,
}: RequestPrefill): string {
  const params = new URLSearchParams({ type, targetType, targetId });
  return `${ROUTES.changeRequestNew}?${params.toString()}`;
}
