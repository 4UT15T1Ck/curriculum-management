import { getJson, withQuery } from '../api/client';
import type { components } from '../api/schema';

export type SubjectGroupSummary =
  components['schemas']['SubjectGroupSummaryDto'];
export type SubjectGroupStatus = components['schemas']['SubjectGroupStatus'];
export type SubjectGroupMemberRole =
  components['schemas']['SubjectGroupMemberRole'];
export const MEMBER_ROLE_LABELS: Record<SubjectGroupMemberRole, string> = {
  MEMBER: 'Thành viên',
  COORDINATOR: 'Điều phối',
};
export interface SubjectGroupListParams {
  facultyId?: string;
  status?: SubjectGroupStatus;
}
export const SUBJECT_GROUPS_PATH = '/subject-groups';
export const subjectGroupsQueryKey = ['subject-groups'] as const;
export const subjectGroupListQueryKey = (params: SubjectGroupListParams) =>
  ['subject-groups', 'list', params] as const;
export function fetchSubjectGroups(
  params: SubjectGroupListParams = {},
): Promise<SubjectGroupSummary[]> {
  return getJson(withQuery(SUBJECT_GROUPS_PATH, { ...params }));
}
