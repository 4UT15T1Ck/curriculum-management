import { AppException } from '../../shared/exception/app.exception.js';
import type { CurriculumFactsReader } from '../../shared/curriculum/curriculum-facts.reader.js';
import { PROGRAM_CONSTRAINT, PROGRAM_ERRORS } from './programs.errors.js';

// EC-08: a row already planned in semester N must stay inside the program, so the semester count cannot drop below N.
export async function assertSemestersCoverCurriculum(
  facts: Pick<CurriculumFactsReader, 'maxPlannedSemester'>,
  versionId: string,
  semesterCount: number | undefined,
): Promise<void> {
  if (semesterCount === undefined) {
    return;
  }
  const planned = await facts.maxPlannedSemester(versionId);
  if (planned === null || semesterCount >= planned) {
    return;
  }
  const base = PROGRAM_ERRORS.SEMESTERS_BELOW_CURRICULUM;
  throw new AppException(
    {
      ...base,
      message: `${base.message} ${planned}; chuyển các học phần đó trước khi giảm số học kỳ.`,
    },
    [
      {
        field: 'semesterCount',
        constraints: [PROGRAM_CONSTRAINT.SEMESTERS_COVER_CURRICULUM],
      },
    ],
  );
}
