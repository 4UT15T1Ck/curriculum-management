import { getJson, sendJson } from '../../../shared/api/client';
import type { components } from '../../../shared/api/schema';

export type RoleAssignment = components['schemas']['RoleAssignmentDto'];
export type CreateRoleAssignmentRequest =
  components['schemas']['CreateRoleAssignmentDto'];
export type Role = components['schemas']['RoleDto'];

const ROLES_PATH = '/roles';
const assignmentsPath = (userId: string) =>
  `/users/${encodeURIComponent(userId)}/role-assignments`;
export const fetchRoles = () => getJson<Role[]>(ROLES_PATH);
export const fetchRoleAssignments = (userId: string) =>
  getJson<RoleAssignment[]>(assignmentsPath(userId));
export const assignRole = (userId: string, body: CreateRoleAssignmentRequest) =>
  sendJson<RoleAssignment>('POST', assignmentsPath(userId), body);
export const revokeRole = (userId: string, assignmentId: string) =>
  sendJson<RoleAssignment>(
    'POST',
    `${assignmentsPath(userId)}/${encodeURIComponent(assignmentId)}/revoke`,
  );
