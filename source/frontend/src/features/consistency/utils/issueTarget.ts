import { generatePath } from 'react-router';
import { FOCUS_PARAM, ROUTES } from '../../../routes';
import type { ConsistencyIssue } from '../api/consistency';

// Where an issue is fixed: the row, the elective group, or the program's own credit figures.
export function issueTarget(
  issue: Pick<ConsistencyIssue, 'code' | 'itemId' | 'groupId'>,
  ids: { programId: string; versionId: string },
): string | null {
  if (issue.itemId)
    return `${generatePath(ROUTES.curriculum, ids)}?${new URLSearchParams({ [FOCUS_PARAM]: issue.itemId })}`;
  if (issue.groupId)
    return `${generatePath(ROUTES.electiveGroups, ids)}?${new URLSearchParams({ [FOCUS_PARAM]: issue.groupId })}`;
  if (
    issue.code === 'CREDIT_MISMATCH' ||
    issue.code === 'CREDIT_MISMATCH_ACCEPTED'
  )
    return generatePath(ROUTES.programDetail, { programId: ids.programId });
  return null;
}

// A positive gap means the curriculum holds more than declared. Gaps stay strings: no float arithmetic on credits.
export function formatGap(gap: string): string {
  return gap === '0' || gap.startsWith('-') ? gap : `+${gap}`;
}
