import type { EditState } from '../authz/edit-path.js';
import { HOME_FACULTY_CODE } from '../org-units/home-faculty.js';
import type { CourseUsageReader } from './course-usage.reader.js';

// Catalog data of a course (fields and relations) follows the course's own release state (F04-05).
export async function courseEditState(
  usage: CourseUsageReader,
  course: { id: string; ownerFaculty: { unitCode: string } },
): Promise<EditState> {
  return {
    released: await usage.inReleasedVersion(course.id),
    draftOpenToRequestHolders:
      course.ownerFaculty.unitCode === HOME_FACULTY_CODE,
  };
}
