import type {
  ChangeRequestType,
  ChangeTargetType,
} from '../api/changeRequests';
import { DATA_TYPES, TYPE_TARGETS, UNSUPPORTED_TYPES } from '../requestTypes';
import type { RequestHeaderValues } from '../schema/requestRules';

// "Tạo đề xuất" on any screen links here with the target already chosen (US-053 AC1); anything unknown is ignored.
export function readPrefill(
  params: URLSearchParams,
): Partial<RequestHeaderValues> {
  const type = DATA_TYPES.find(
    (candidate) =>
      candidate === params.get('type') &&
      !UNSUPPORTED_TYPES.includes(candidate),
  );
  if (!type) return {};
  const kinds: readonly ChangeTargetType[] = TYPE_TARGETS[type];
  const targetType = kinds.find((kind) => kind === params.get('targetType'));
  const targetId = params.get('targetId');
  return {
    requestType: type satisfies ChangeRequestType,
    targetType: targetType ?? kinds[0],
    ...(targetType && targetId ? { targetId } : {}),
  };
}
