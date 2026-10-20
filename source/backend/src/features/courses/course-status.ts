import { CourseStatus } from '../../generated/prisma/client.js';

export const COURSE_TRANSITION = {
  DISCONTINUE: 'discontinue',
  REOPEN: 'reopen',
  CANCEL: 'cancel',
} as const;
export type CourseTransition =
  (typeof COURSE_TRANSITION)[keyof typeof COURSE_TRANSITION];

// HP-02..HP-04, S-10: Cancelled is final.
export const COURSE_TRANSITIONS: Record<
  CourseTransition,
  { from: readonly CourseStatus[]; to: CourseStatus }
> = {
  [COURSE_TRANSITION.DISCONTINUE]: {
    from: [CourseStatus.ACTIVE],
    to: CourseStatus.DISCONTINUED,
  },
  [COURSE_TRANSITION.REOPEN]: {
    from: [CourseStatus.DISCONTINUED],
    to: CourseStatus.ACTIVE,
  },
  [COURSE_TRANSITION.CANCEL]: {
    from: [CourseStatus.ACTIVE, CourseStatus.DISCONTINUED],
    to: CourseStatus.CANCELLED,
  },
};
