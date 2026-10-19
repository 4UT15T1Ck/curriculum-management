import { ScopeSource } from '../../src/generated/prisma/client.js';

export const ROLE_CODES = {
  R1: 'R1',
  R2: 'R2',
  R3: 'R3',
  R4: 'R4',
  R5: 'R5',
  R6: 'R6',
} as const;

export type RoleCode = (typeof ROLE_CODES)[keyof typeof ROLE_CODES];

export const SEED_ROLES: readonly {
  roleCode: RoleCode;
  roleName: string;
  scopeSource: ScopeSource;
}[] = [
  {
    roleCode: ROLE_CODES.R1,
    roleName: 'Phòng Đào tạo',
    scopeSource: ScopeSource.NONE,
  },
  {
    roleCode: ROLE_CODES.R2,
    roleName: 'Ban lãnh đạo khoa',
    scopeSource: ScopeSource.NONE,
  },
  {
    roleCode: ROLE_CODES.R3,
    roleName: 'Giám đốc CTĐT',
    scopeSource: ScopeSource.PROGRAM_DIRECTOR,
  },
  {
    roleCode: ROLE_CODES.R4,
    roleName: 'Điều phối nhóm chuyên môn',
    scopeSource: ScopeSource.SUBJECT_GROUP_COORDINATOR,
  },
  {
    roleCode: ROLE_CODES.R5,
    roleName: 'Giảng viên',
    scopeSource: ScopeSource.SUBJECT_GROUP_MEMBER,
  },
  {
    roleCode: ROLE_CODES.R6,
    roleName: 'Sinh viên',
    scopeSource: ScopeSource.OWN_ENROLLMENT,
  },
];
