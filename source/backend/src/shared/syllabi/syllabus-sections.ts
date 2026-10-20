// The six rich-text sections of a syllabus revision; the editor, the revision copier and the request differ share this list.
export const SYLLABUS_SECTION_FIELDS = [
  'courseDescription',
  'englishDescription',
  'objectives',
  'teachingMethods',
  'assessmentMethods',
  'references',
] as const;
export type SyllabusSectionField = (typeof SYLLABUS_SECTION_FIELDS)[number];
