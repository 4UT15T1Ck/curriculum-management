import { describe, expect, it } from 'vitest';
import { Prisma } from '../../generated/prisma/client.js';
import {
  groupRequiredCredits,
  programCredits,
  type CreditGroup,
  type CreditItem,
} from './program-credits.js';

const dec = (value: string) => new Prisma.Decimal(value);
const row = (credits: string, patch: Partial<CreditItem> = {}): CreditItem => ({
  credits: dec(credits),
  isElective: false,
  electiveGroupId: null,
  ...patch,
});
const group = (patch: Partial<CreditGroup> = {}): CreditGroup => ({
  id: 'g1',
  minCredits: null,
  minCourses: null,
  ...patch,
});
const member = (credits: string) =>
  row(credits, { isElective: true, electiveGroupId: 'g1' });

describe('programCredits', () => {
  it('adds compulsory credits and a group minimum, not its listed credits (KB-013, US-029 AC1, AC2)', () => {
    const items = [
      row('3'),
      row('2.5'),
      row('0'),
      ...[1, 2, 3, 4, 5].map(() => member('3')),
    ];

    const credits = programCredits(items, [group({ minCredits: dec('6') })]);

    expect(credits.compulsory.toString()).toBe('5.5');
    expect(credits.elective.toString()).toBe('6');
    expect(credits.total.toString()).toBe('11.5');
  });

  it('adds nothing for an elective row outside every group', () => {
    const credits = programCredits(
      [row('3'), row('3', { isElective: true })],
      [],
    );
    expect(credits.total.toString()).toBe('3');
  });
});

describe('groupRequiredCredits', () => {
  it('takes the cheapest members for a course-count minimum', () => {
    const required = groupRequiredCredits(group({ minCourses: 2 }), [
      dec('3'),
      dec('2'),
      dec('4'),
    ]);
    expect(required.toString()).toBe('5');
  });

  it('takes the larger of the credit and course-count minimums', () => {
    const required = groupRequiredCredits(
      group({ minCredits: dec('4'), minCourses: 2 }),
      [dec('3'), dec('3')],
    );
    expect(required.toString()).toBe('6');
  });
});
