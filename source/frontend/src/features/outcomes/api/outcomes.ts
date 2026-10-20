import { getJson, sendJson } from '../../../shared/api/client';
import type { components } from '../../../shared/api/schema';

export type PloList = components['schemas']['PloListDto'];
export type Plo = components['schemas']['PloDto'];
export type OutcomeVersion = components['schemas']['OutcomeVersionDto'];
export type PloHeader = components['schemas']['PloHeaderDto'];
export type CreatePloRequest = components['schemas']['CreatePloDto'];
export type UpdatePloRequest = components['schemas']['UpdatePloDto'];
export type CoursePloMatrix = components['schemas']['CoursePloMatrixDto'];
export type CoursePloRow = components['schemas']['CoursePloRowDto'];
export type CoursePloCell = components['schemas']['CoursePloCellDto'];
export type ItemCloPloMatrix = components['schemas']['ItemCloPloMatrixDto'];
export type ProgramCloPloMatrix =
  components['schemas']['ProgramCloPloMatrixDto'];
export type ProgramCloPloRow = components['schemas']['ProgramCloPloRowDto'];
export type CloRef = components['schemas']['CloRefDto'];
export type CloPloLink = components['schemas']['CloPloLinkDto'];
export type OutcomeCoverage = components['schemas']['OutcomeCoverageDto'];

const versionPath = (versionId: string) =>
  `/program-versions/${encodeURIComponent(versionId)}`;
const itemPath = (itemId: string) =>
  `/curriculum-items/${encodeURIComponent(itemId)}`;
const ploPath = (ploId: string) => `/plos/${encodeURIComponent(ploId)}`;
const weightPath = (itemId: string, ploId: string) =>
  `${itemPath(itemId)}/plo-weights/${encodeURIComponent(ploId)}`;

export const fetchPlos = (versionId: string) =>
  getJson<PloList>(`${versionPath(versionId)}/plos`);
export const createPlo = (versionId: string, body: CreatePloRequest) =>
  sendJson<Plo>('POST', `${versionPath(versionId)}/plos`, body);
export const updatePlo = (ploId: string, body: UpdatePloRequest) =>
  sendJson<Plo>('PATCH', ploPath(ploId), body);
export const deletePlo = (ploId: string) =>
  sendJson<void>('DELETE', ploPath(ploId));
export const reorderPlos = (versionId: string, ids: string[]) =>
  sendJson<Plo[]>('PUT', `${versionPath(versionId)}/plos/order`, { ids });

export const fetchCoursePloMatrix = (versionId: string) =>
  getJson<CoursePloMatrix>(`${versionPath(versionId)}/course-plo-matrix`);
export const setPloWeight = (itemId: string, ploId: string, weight: string) =>
  sendJson<CoursePloCell>('PUT', weightPath(itemId, ploId), { weight });
export const removePloWeight = (itemId: string, ploId: string) =>
  sendJson<void>('DELETE', weightPath(itemId, ploId));

export const fetchProgramCloPlo = (versionId: string) =>
  getJson<ProgramCloPloMatrix>(`${versionPath(versionId)}/clo-plo-matrix`);
export const fetchItemCloPlo = (itemId: string) =>
  getJson<ItemCloPloMatrix>(`${itemPath(itemId)}/clo-plo-matrix`);
export const replaceCloPloLinks = (itemId: string, links: CloPloLink[]) =>
  sendJson<ItemCloPloMatrix>('PUT', `${itemPath(itemId)}/clo-plo-links`, {
    links,
  });

export const fetchCoverage = (versionId: string) =>
  getJson<OutcomeCoverage>(`${versionPath(versionId)}/outcome-coverage`);
