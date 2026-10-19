import { describe, expect, it } from 'vitest';
import { additionFor, itemsFromState, stateFromItems } from './courseItems';

describe('course items state', () => {
  it('turns state into items in the order the server numbers them, each with a key', () => {
    const { items, keys } = itemsFromState({
      fields: { credits: '4' },
      relationEdits: {
        r1: { kind: 'remove' },
        r2: { kind: 'update', minScore: '2.5' },
      },
      additions: [additionFor('needsPrerequisite', 'c1', 'c2', null)],
    });
    expect(items).toEqual([
      { operation: 'SET_COURSE_FIELD', field: 'credits', value: '4' },
      { operation: 'REMOVE_RELATION', relationId: 'r1' },
      { operation: 'UPDATE_RELATION', relationId: 'r2', minScore: '2.5' },
      {
        operation: 'ADD_RELATION',
        sourceCourseId: 'c2',
        targetCourseId: 'c1',
        relationType: 'PREREQUISITE',
        minScore: null,
      },
    ]);
    expect(keys).toEqual([
      'field:credits',
      'relation:r1',
      'relation:r2',
      'add:0',
    ]);
  });

  it('puts the current course on the side the choice names', () => {
    expect(additionFor('isPriorOf', 'c1', 'c2', '2')).toMatchObject({
      sourceCourseId: 'c1',
      targetCourseId: 'c2',
      relationType: 'PRIOR',
      minScore: '2',
    });
    expect(additionFor('replacedBy', 'c1', 'c2', null)).toMatchObject({
      sourceCourseId: 'c1',
      targetCourseId: 'c2',
      relationType: 'REPLACEMENT',
    });
  });

  it('rebuilds state from stored items and ignores operations of other kinds', () => {
    const state = stateFromItems([
      {
        id: '1',
        entityType: 'COURSE_FIELD',
        itemKey: 'credits',
        label: '',
        oldValue: null,
        newValue: {
          operation: 'SET_COURSE_FIELD',
          field: 'credits',
          value: '5',
        },
      },
      {
        id: '2',
        entityType: 'COURSE_RELATION',
        itemKey: 'k',
        label: '',
        oldValue: null,
        newValue: { operation: 'REMOVE_RELATION', relationId: 'r9' },
      },
      {
        id: '3',
        entityType: 'ORG_MEMBERSHIP',
        itemKey: 'k',
        label: '',
        oldValue: null,
        newValue: {
          operation: 'END_MEMBERSHIP',
          memberRowId: 'm',
          validTo: '2026-12-31',
        },
      },
      {
        id: '4',
        entityType: 'COURSE_FIELD',
        itemKey: 'x',
        label: '',
        oldValue: null,
        newValue: null,
      },
    ] as never);
    expect(state.fields).toEqual({ credits: '5' });
    expect(state.relationEdits).toEqual({ r9: { kind: 'remove' } });
    expect(state.additions).toEqual([]);
  });
});
