import type {
  Syllabus,
  SyllabusSectionField,
  UpdateSyllabusRequest,
} from '../api/syllabi';
import { SECTION_LABELS } from '../constants/syllabusLabels';

export const SYLLABUS_SECTION_FIELDS = Object.keys(
  SECTION_LABELS,
) as SyllabusSectionField[];

// Sends only what the user changed, so two people editing different sections do not overwrite each other.
export function changedSections(
  initial: Syllabus,
  values: Partial<Record<SyllabusSectionField, string | null | undefined>>,
): UpdateSyllabusRequest {
  return Object.fromEntries(
    SYLLABUS_SECTION_FIELDS.filter(
      (field) => field in values && (values[field] ?? null) !== initial[field],
    ).map((field) => [field, values[field] ?? null]),
  );
}
