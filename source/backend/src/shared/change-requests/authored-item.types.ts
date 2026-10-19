import type {
  ChangeRequestType,
  CourseRelationType,
  SubjectGroupMemberRole,
} from '../../generated/prisma/client.js';

export const AUTHORED_ENTITY = {
  COURSE_FIELD: 'COURSE_FIELD',
  COURSE_RELATION: 'COURSE_RELATION',
  ORG_MEMBERSHIP: 'ORG_MEMBERSHIP',
  ORG_DIRECTOR: 'ORG_DIRECTOR',
} as const;
export type AuthoredEntity =
  (typeof AUTHORED_ENTITY)[keyof typeof AUTHORED_ENTITY];

export const AUTHORED_OPERATION = {
  SET_COURSE_FIELD: 'SET_COURSE_FIELD',
  ADD_RELATION: 'ADD_RELATION',
  UPDATE_RELATION: 'UPDATE_RELATION',
  REMOVE_RELATION: 'REMOVE_RELATION',
  ADD_MEMBER: 'ADD_MEMBER',
  END_MEMBERSHIP: 'END_MEMBERSHIP',
  ASSIGN_DIRECTOR: 'ASSIGN_DIRECTOR',
  END_DIRECTOR: 'END_DIRECTOR',
} as const;
export type AuthoredOperation =
  (typeof AUTHORED_OPERATION)[keyof typeof AUTHORED_OPERATION];

export const COURSE_REQUEST_FIELDS = [
  'courseName',
  'englishName',
  'credits',
  'courseType',
  'ownerGroupId',
] as const;
export type CourseRequestField = (typeof COURSE_REQUEST_FIELDS)[number];

// Stored in ChangeItem.newValue; F-14 / F-15 apply it with the owning feature's rules.
export type AuthoredPayload =
  | {
      operation: 'SET_COURSE_FIELD';
      field: CourseRequestField;
      value: string | null;
      // Readable form of an id value (the group code for ownerGroupId); the apply reads `value`.
      display?: string | null;
    }
  | {
      operation: 'ADD_RELATION';
      sourceCourseId: string;
      targetCourseId: string;
      relationType: CourseRelationType;
      minScore: string | null;
    }
  | {
      operation: 'UPDATE_RELATION';
      relationId: string;
      minScore: string | null;
    }
  | { operation: 'REMOVE_RELATION'; relationId: string }
  | {
      operation: 'ADD_MEMBER';
      lecturerId: string;
      memberRole: SubjectGroupMemberRole;
      validFrom: string;
      validTo: string | null;
    }
  | { operation: 'END_MEMBERSHIP'; memberRowId: string; validTo: string }
  | {
      operation: 'ASSIGN_DIRECTOR';
      directorId: string;
      validFrom: string;
      validTo: string | null;
    }
  | { operation: 'END_DIRECTOR'; assignmentId: string; validTo: string };

export const OPERATIONS_BY_TYPE: Partial<
  Record<ChangeRequestType, readonly AuthoredOperation[]>
> = {
  COURSE_RELATION: [
    AUTHORED_OPERATION.SET_COURSE_FIELD,
    AUTHORED_OPERATION.ADD_RELATION,
    AUTHORED_OPERATION.UPDATE_RELATION,
    AUTHORED_OPERATION.REMOVE_RELATION,
  ],
  ORGANIZATION: [
    AUTHORED_OPERATION.ADD_MEMBER,
    AUTHORED_OPERATION.END_MEMBERSHIP,
    AUTHORED_OPERATION.ASSIGN_DIRECTOR,
    AUTHORED_OPERATION.END_DIRECTOR,
  ],
};
