import { getJson, sendJson } from '../../../shared/api/client';
import type { components } from '../../../shared/api/schema';

export type CourseRelation = components['schemas']['CourseRelationDto'];
export type RelatedCourse = components['schemas']['RelatedCourseDto'];
export type CourseRelationType = components['schemas']['CourseRelationType'];
export type CreateCourseRelationRequest =
  components['schemas']['CreateCourseRelationDto'];

const RELATIONS_PATH = '/course-relations';
const relationsOfCourse = (courseId: string) =>
  `/courses/${encodeURIComponent(courseId)}/relations`;
const relationPath = (relationId: string) =>
  `${RELATIONS_PATH}/${encodeURIComponent(relationId)}`;

export const fetchCourseRelations = (courseId: string) =>
  getJson<CourseRelation[]>(relationsOfCourse(courseId));
export const createCourseRelation = (body: CreateCourseRelationRequest) =>
  sendJson<CourseRelation>('POST', RELATIONS_PATH, body);
export const updateRelationMinScore = (
  relationId: string,
  minScore: string | null,
) => sendJson<CourseRelation>('PATCH', relationPath(relationId), { minScore });
export const deleteCourseRelation = (relationId: string) =>
  sendJson<void>('DELETE', relationPath(relationId));
