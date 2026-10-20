import { getJson, sendJson } from '../../../shared/api/client';
import type { components } from '../../../shared/api/schema';

export type ConsistencyReport = components['schemas']['ConsistencyReportDto'];
export type ConsistencyIssue = components['schemas']['ConsistencyIssueDto'];
export type CreditCheck = components['schemas']['CreditCheckDto'];
export type GroupRequirement = components['schemas']['GroupRequirementDto'];
export type CreditBreakdown = components['schemas']['CreditBreakdownDto'];
export type AcceptCreditMismatchInput =
  components['schemas']['AcceptCreditMismatchDto'];

const versionPath = (versionId: string) =>
  `/program-versions/${encodeURIComponent(versionId)}`;

export const fetchConsistency = (versionId: string) =>
  getJson<ConsistencyReport>(`${versionPath(versionId)}/consistency`);
export const acceptCreditMismatch = (
  versionId: string,
  body: AcceptCreditMismatchInput,
) =>
  sendJson<ConsistencyReport>(
    'PUT',
    `${versionPath(versionId)}/credit-mismatch-acceptance`,
    body,
  );
