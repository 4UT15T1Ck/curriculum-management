import { getJson, sendJson, withQuery } from '../../../shared/api/client';
import type { components, operations } from '../../../shared/api/schema';

export type CourseSummary = components['schemas']['CourseSummaryDto'];
export type CourseDetail = components['schemas']['CourseDetailDto'];
export type CoursePage = components['schemas']['CoursePageDto'];
export type CourseUsage = components['schemas']['CourseUsageDto'];
export type CourseType = components['schemas']['CourseType'];
export type CourseStatus = components['schemas']['CourseStatus'];
export type CreateCourseRequest = components['schemas']['CreateCourseDto'];
export type UpdateCourseRequest = components['schemas']['UpdateCourseDto'];
export type CourseQuery = NonNullable<
  operations['CoursesController_list']['parameters']['query']
>;

export const COURSES_PATH = '/courses';
const coursePath = (courseId: string) =>
  `${COURSES_PATH}/${encodeURIComponent(courseId)}`;

export const COURSE_ACTION = {
  DISCONTINUE: 'discontinue',
  REOPEN: 'reopen',
  CANCEL: 'cancel',
} as const;
export type CourseAction = (typeof COURSE_ACTION)[keyof typeof COURSE_ACTION];

export const fetchCourses = (query: CourseQuery) =>
  getJson<CoursePage>(withQuery(COURSES_PATH, { ...query }));
export const fetchCourse = (courseId: string) =>
  getJson<CourseDetail>(coursePath(courseId));
export const createCourse = (body: CreateCourseRequest) =>
  sendJson<CourseDetail>('POST', COURSES_PATH, body);
export const updateCourse = (courseId: string, body: UpdateCourseRequest) =>
  sendJson<CourseDetail>('PATCH', coursePath(courseId), body);
export const changeCourseStatus = (courseId: string, action: CourseAction) =>
  sendJson<CourseDetail>('POST', `${coursePath(courseId)}/${action}`);
