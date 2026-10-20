import { describe, expect, it } from 'vitest';
import { formatGap, issueTarget } from './issueTarget';

const ids = { programId: 'p1', versionId: 'v1' };
const issue = (patch: object) => ({
  code: 'EMPTY_SEMESTER' as const,
  itemId: null,
  groupId: null,
  ...patch,
});

describe('issueTarget', () => {
  it('sends a row issue to the row on the curriculum page', () => {
    expect(issueTarget(issue({ itemId: 'i1' }), ids)).toBe(
      '/programs/p1/versions/v1/curriculum?focus=i1',
    );
  });

  it('sends a cycle, which carries an item id, to the row', () => {
    expect(
      issueTarget(issue({ code: 'REQUISITE_CYCLE', itemId: 'i9' }), ids),
    ).toContain('focus=i9');
  });

  it('sends a group issue to the elective groups page', () => {
    expect(issueTarget(issue({ groupId: 'g1' }), ids)).toBe(
      '/programs/p1/versions/v1/elective-groups?focus=g1',
    );
  });

  it('sends a credit issue to the program overview', () => {
    expect(issueTarget(issue({ code: 'CREDIT_MISMATCH' }), ids)).toBe(
      '/programs/p1',
    );
  });

  it('has no target for an empty semester', () => {
    expect(issueTarget(issue({}), ids)).toBeNull();
  });
});

describe('formatGap', () => {
  it('prefixes a plus on a positive gap only', () => {
    expect(formatGap('2.5')).toBe('+2.5');
    expect(formatGap('-2')).toBe('-2');
    expect(formatGap('0')).toBe('0');
  });
});
