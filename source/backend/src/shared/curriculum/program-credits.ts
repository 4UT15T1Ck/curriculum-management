import { Prisma } from '../../generated/prisma/client.js';

export interface CreditItem {
  credits: Prisma.Decimal;
  isElective: boolean;
  electiveGroupId: string | null;
}

export interface CreditGroup {
  id: string;
  minCredits: Prisma.Decimal | null;
  minCourses: number | null;
}

export interface ProgramCredits {
  compulsory: Prisma.Decimal;
  elective: Prisma.Decimal;
  total: Prisma.Decimal;
}

const ZERO = new Prisma.Decimal(0);

function sum(values: readonly Prisma.Decimal[]): Prisma.Decimal {
  return values.reduce((total, value) => total.plus(value), ZERO);
}

// The least a student can take to satisfy the group: its credit minimum, or the credits of its cheapest
// members when only a course count is set, whichever is larger when both are.
export function groupRequiredCredits(
  group: CreditGroup,
  memberCredits: readonly Prisma.Decimal[],
): Prisma.Decimal {
  const cheapest = [...memberCredits]
    .sort((a, b) => a.comparedTo(b))
    .slice(0, group.minCourses ?? 0);
  return Prisma.Decimal.max(group.minCredits ?? ZERO, sum(cheapest));
}

// Elective rows outside every group add nothing; they are flagged by curriculumWarnings.
export function programCredits(
  items: readonly CreditItem[],
  groups: readonly CreditGroup[],
): ProgramCredits {
  const compulsory = sum(
    items.filter((item) => !item.isElective).map((item) => item.credits),
  );
  const elective = sum(
    groups.map((group) =>
      groupRequiredCredits(
        group,
        items
          .filter((item) => item.electiveGroupId === group.id)
          .map((item) => item.credits),
      ),
    ),
  );
  return { compulsory, elective, total: compulsory.plus(elective) };
}
