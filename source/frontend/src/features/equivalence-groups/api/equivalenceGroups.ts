import { getJson, sendJson, withQuery } from '../../../shared/api/client';
import type { components, operations } from '../../../shared/api/schema';

export type EquivalenceGroup = components['schemas']['EquivalenceGroupDto'];
export type EquivalenceGroupPage =
  components['schemas']['EquivalenceGroupPageDto'];
export type CreateEquivalenceGroupRequest =
  components['schemas']['CreateEquivalenceGroupDto'];
export type UpdateEquivalenceGroupRequest =
  components['schemas']['UpdateEquivalenceGroupDto'];
export type EquivalenceGroupQuery = NonNullable<
  operations['EquivalenceGroupsController_list']['parameters']['query']
>;
// The course page carries the id of the course's group, which a merge needs.
export type CourseGroupInfo = Pick<
  components['schemas']['CourseDetailDto'],
  'id' | 'courseCode' | 'equivalenceGroup'
>;

const GROUPS_PATH = '/equivalence-groups';
const groupPath = (groupId: string) =>
  `${GROUPS_PATH}/${encodeURIComponent(groupId)}`;

export const fetchEquivalenceGroups = (query: EquivalenceGroupQuery) =>
  getJson<EquivalenceGroupPage>(withQuery(GROUPS_PATH, { ...query }));
export const fetchEquivalenceGroup = (groupId: string) =>
  getJson<EquivalenceGroup>(groupPath(groupId));
export const createEquivalenceGroup = (body: CreateEquivalenceGroupRequest) =>
  sendJson<EquivalenceGroup>('POST', GROUPS_PATH, body);
export const updateEquivalenceGroup = (
  groupId: string,
  body: UpdateEquivalenceGroupRequest,
) => sendJson<EquivalenceGroup>('PATCH', groupPath(groupId), body);
export const addEquivalenceMember = (groupId: string, courseId: string) =>
  sendJson<EquivalenceGroup>('POST', `${groupPath(groupId)}/members`, {
    courseId,
  });
export const removeEquivalenceMember = (groupId: string, courseId: string) =>
  sendJson<EquivalenceGroup>(
    'DELETE',
    `${groupPath(groupId)}/members/${encodeURIComponent(courseId)}`,
  );
export const mergeEquivalenceGroups = (keptId: string, otherGroupId: string) =>
  sendJson<EquivalenceGroup>('POST', `${groupPath(keptId)}/merge`, {
    otherGroupId,
  });
export const dissolveEquivalenceGroup = (groupId: string) =>
  sendJson<void>('POST', `${groupPath(groupId)}/dissolve`);
export const fetchCourseGroup = (courseId: string) =>
  getJson<CourseGroupInfo>(`/courses/${encodeURIComponent(courseId)}`);
