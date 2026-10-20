import type {
  ChangeRequest,
  ChangeRequestType,
  ChangeTargetType,
} from '../../generated/prisma/client.js';
import { AppException } from '../exception/app.exception.js';
import { RELEASE_ERRORS } from './release.errors.js';

export const VERSION_NUMBER_PATTERN = /^\d{1,3}\.\d{1,3}$/;
export const FIRST_VERSION_NUMBER = '1.0';

export const VERSION_BUMP = { MAJOR: 'MAJOR', MINOR: 'MINOR' } as const;
export type VersionBump = (typeof VERSION_BUMP)[keyof typeof VERSION_BUMP];

export function parseVersionNumber(value: string): {
  major: number;
  minor: number;
} {
  if (!VERSION_NUMBER_PATTERN.test(value)) {
    throw new AppException(RELEASE_ERRORS.VERSION_NUMBER_INVALID);
  }
  const [major, minor] = value.split('.').map(Number);
  return { major, minor };
}

export function nextVersionNumber(base: string, bump: VersionBump): string {
  const { major, minor } = parseVersionNumber(base);
  const next =
    bump === VERSION_BUMP.MAJOR ? `${major + 1}.0` : `${major}.${minor + 1}`;
  if (!VERSION_NUMBER_PATTERN.test(next)) {
    throw new AppException(RELEASE_ERRORS.VERSION_NUMBER_INVALID);
  }
  return next;
}

// BR-24: a structural change (curriculum, program-level outcomes) takes a new major number, the rest a minor one.
export function bumpForRequest(
  request: Pick<ChangeRequest, 'requestType' | 'targetType'>,
): VersionBump {
  return isMajorChange(request.requestType, request.targetType)
    ? VERSION_BUMP.MAJOR
    : VERSION_BUMP.MINOR;
}

function isMajorChange(
  type: ChangeRequestType,
  target: ChangeTargetType,
): boolean {
  return type === 'CURRICULUM' || (type === 'OUTCOME' && target === 'PROGRAM');
}

// The number of the next release on top of `base`, among the numbers the program already holds.
// A major change takes the highest major plus one; a minor one the highest minor of the base's major plus one.
// Numeric, never lexical: "1.10" is above "1.9". A correction is a minor release of the version it corrects.
export function nextReleaseNumber(
  base: string,
  existing: readonly (string | null)[],
  bump: VersionBump,
): string {
  const held = [base, ...existing].flatMap((value) =>
    value === null ? [] : [parseVersionNumber(value)],
  );
  if (bump === VERSION_BUMP.MAJOR) {
    return `${Math.max(...held.map((v) => v.major)) + 1}.0`;
  }
  const { major } = parseVersionNumber(base);
  const minors = held.filter((v) => v.major === major).map((v) => v.minor);
  return nextVersionNumber(
    `${major}.${Math.max(...minors)}`,
    VERSION_BUMP.MINOR,
  );
}
