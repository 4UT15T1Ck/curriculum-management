import type { ApprovalStep } from '../api/changeRequests';

export interface LevelGroup {
  approvalLevel: number;
  levelName: string;
  rows: ApprovalStep[];
}

// Levels in order; only levels that have rows (an organisational request has just the last one).
export function groupByLevel(steps: readonly ApprovalStep[]): LevelGroup[] {
  const levels = new Map<number, LevelGroup>();
  for (const step of steps) {
    const held = levels.get(step.approvalLevel);
    if (held) held.rows.push(step);
    else
      levels.set(step.approvalLevel, {
        approvalLevel: step.approvalLevel,
        levelName: step.levelName,
        rows: [step],
      });
  }
  return [...levels.values()].sort((a, b) => a.approvalLevel - b.approvalLevel);
}
