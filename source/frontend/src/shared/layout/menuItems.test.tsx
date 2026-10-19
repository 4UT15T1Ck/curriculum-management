import { describe, expect, it } from 'vitest';
import { ROUTES } from '../../routes';
import {
  APP_MENU,
  openMenuGroups,
  selectedMenuPath,
  toMenuItems,
} from './menuItems';

describe('app menu', () => {
  it('nests the equivalence groups under Học phần for holders of course.view', () => {
    const items = toMenuItems(APP_MENU, ['course.view']);
    const courses = items.find((item) => item.key === 'group:Học phần');
    expect(courses).toBeDefined();
    expect(
      'children' in courses! && courses.children.map((child) => child.key),
    ).toEqual([ROUTES.courses, ROUTES.equivalenceGroups]);
  });

  it('hides the whole group without course.view', () => {
    const keys = toMenuItems(APP_MENU, ['user.manage']).map((item) => item.key);
    expect(keys).not.toContain('group:Học phần');
    expect(keys).toContain(ROUTES.users);
  });

  it('selects the leaf of a child page and opens its group', () => {
    expect(selectedMenuPath(APP_MENU, '/courses/c1/edit')).toBe(ROUTES.courses);
    expect(selectedMenuPath(APP_MENU, ROUTES.equivalenceGroups)).toBe(
      ROUTES.equivalenceGroups,
    );
    expect(openMenuGroups(APP_MENU, ROUTES.equivalenceGroups)).toEqual([
      'group:Học phần',
    ]);
    expect(openMenuGroups(APP_MENU, ROUTES.users)).toEqual([]);
  });

  it('lists the programs for staff and hides them for a caller who only holds the student role', () => {
    const permissions = ['program.view' as const];
    expect(
      toMenuItems(APP_MENU, permissions, ['R2']).map((item) => item.key),
    ).toContain(ROUTES.programs);
    expect(
      toMenuItems(APP_MENU, permissions, ['R6']).map((item) => item.key),
    ).not.toContain(ROUTES.programs);
    // A student who also holds a staff role keeps the entry.
    expect(
      toMenuItems(APP_MENU, permissions, ['R6', 'R5']).map((item) => item.key),
    ).toContain(ROUTES.programs);
    expect(selectedMenuPath(APP_MENU, '/programs/p1/edit')).toBe(
      ROUTES.programs,
    );
  });
});
