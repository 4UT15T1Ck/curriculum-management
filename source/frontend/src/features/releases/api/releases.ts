import { getJson, sendJson } from '../../../shared/api/client';
import type { components } from '../../../shared/api/schema';

type Schemas = components['schemas'];

export type SemesterInput = Schemas['CreateSemesterDto'];
export type SemesterPatch = Schemas['UpdateSemesterDto'];
export type CohortInput = Schemas['CreateCohortDto'];
export type CohortPatch = Schemas['UpdateCohortDto'];
export type ReleaseCheck = Schemas['ReleaseCheckDto'];
export type SyllabusReleaseIssue = Schemas['SyllabusReleaseIssueDto'];
export type ReleaseVersionInput = Schemas['ReleaseVersionDto'];
export type IssueCorrectionInput = Schemas['IssueCorrectionDto'];
export type VersionRef = Schemas['VersionRefDto'];
export type VersionList = Schemas['VersionListDto'];
export type VersionDetail = Schemas['VersionDetailDto'];
export type VersionRow = Schemas['VersionRowDto'];

const programPath = (programId: string) =>
  `/programs/${encodeURIComponent(programId)}`;
const versionPath = (programId: string, versionId: string) =>
  `${programPath(programId)}/versions/${encodeURIComponent(versionId)}`;
const correctionPath = (
  programId: string,
  versionId: string,
  correctionId: string,
) =>
  `${versionPath(programId, versionId)}/corrections/${encodeURIComponent(correctionId)}`;

export const createSemester = (body: SemesterInput) =>
  sendJson<Schemas['SemesterDto']>('POST', '/semesters', body);
export const updateSemester = (id: string, body: SemesterPatch) =>
  sendJson<Schemas['SemesterDto']>(
    'PATCH',
    `/semesters/${encodeURIComponent(id)}`,
    body,
  );
export const createCohort = (body: CohortInput) =>
  sendJson<Schemas['CohortDto']>('POST', '/cohorts', body);
export const updateCohort = (id: string, body: CohortPatch) =>
  sendJson<Schemas['CohortDto']>(
    'PATCH',
    `/cohorts/${encodeURIComponent(id)}`,
    body,
  );

export const fetchReleaseCheck = (programId: string, versionId: string) =>
  getJson<ReleaseCheck>(`${versionPath(programId, versionId)}/release-check`);
export const releaseVersion = (
  programId: string,
  versionId: string,
  body: ReleaseVersionInput,
) =>
  sendJson<VersionDetail>(
    'POST',
    `${versionPath(programId, versionId)}/release`,
    body,
  );

export const fetchVersionHistory = (programId: string) =>
  getJson<VersionList>(`${programPath(programId)}/versions`);
export const fetchVersionDetail = (programId: string, versionId: string) =>
  getJson<VersionDetail>(versionPath(programId, versionId));

export const openCorrection = (programId: string, versionId: string) =>
  sendJson<VersionDetail>(
    'POST',
    `${versionPath(programId, versionId)}/corrections`,
  );
export const issueCorrection = (
  programId: string,
  versionId: string,
  correctionId: string,
  body: IssueCorrectionInput,
) =>
  sendJson<VersionDetail>(
    'POST',
    `${correctionPath(programId, versionId, correctionId)}/issue`,
    body,
  );
export const discardCorrection = (
  programId: string,
  versionId: string,
  correctionId: string,
) =>
  sendJson<void>('DELETE', correctionPath(programId, versionId, correctionId));
