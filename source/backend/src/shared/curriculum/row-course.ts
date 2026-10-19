import type { Prisma } from '../../generated/prisma/client.js';

// A released row shows the name and credits it was released with; a Draft row has no snapshot and reads the live course.
export function rowCredits(item: {
  creditsSnapshot: Prisma.Decimal | null;
  course: { credits: Prisma.Decimal };
}): Prisma.Decimal {
  return item.creditsSnapshot ?? item.course.credits;
}

export function rowCourse<
  T extends { courseName: string; credits: Prisma.Decimal },
>(item: {
  courseNameSnapshot: string | null;
  creditsSnapshot: Prisma.Decimal | null;
  course: T;
}): T {
  return {
    ...item.course,
    courseName: item.courseNameSnapshot ?? item.course.courseName,
    credits: rowCredits(item),
  };
}
