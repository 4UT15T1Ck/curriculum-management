import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { step } from '../testFixtures';
import { groupByLevel } from '../utils/groupByLevel';
import { StepProgress } from './StepProgress';

describe('StepProgress', () => {
  it('shows one line per approver of a level, so two coordinators of one group show two lines (EC-22)', () => {
    render(
      <StepProgress
        steps={[
          step('1', 1, {
            approver: { id: 'a', fullName: 'Điều phối An' },
            forSubjectGroup: { id: 'g', groupCode: 'G1', groupName: 'Nhóm 1' },
          }),
          step('2', 1, {
            approver: { id: 'b', fullName: 'Điều phối Bình' },
            forSubjectGroup: { id: 'g', groupCode: 'G1', groupName: 'Nhóm 1' },
          }),
          step('3', 3, { approver: null }),
        ]}
      />,
    );
    expect(
      screen.getByText('Cấp 1 — Điều phối nhóm chuyên môn'),
    ).toBeInTheDocument();
    expect(screen.getByText('Điều phối An')).toBeInTheDocument();
    expect(screen.getByText('Điều phối Bình')).toBeInTheDocument();
    expect(screen.getAllByText('(G1)')).toHaveLength(2);
    expect(
      screen.getByText('Phòng Đào tạo', { selector: 'span' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Cấp 2/)).not.toBeInTheDocument();
  });

  it('marks a skipped row with its reason and an approved one with its time', () => {
    render(
      <StepProgress
        steps={[
          step('1', 2, {
            isSkipped: true,
            action: 'APPROVE',
            skipReason: 'Người duyệt là người tạo đề xuất',
          }),
          step('2', 3, {
            approver: null,
            action: 'APPROVE',
            recordedAt: '2026-10-19T03:30:00.000Z',
          }),
        ]}
      />,
    );
    expect(screen.getByText('Bỏ qua')).toBeInTheDocument();
    expect(
      screen.getByText('Người duyệt là người tạo đề xuất'),
    ).toBeInTheDocument();
    expect(screen.getByText('Đã duyệt')).toBeInTheDocument();
  });
});

describe('groupByLevel', () => {
  it('orders the levels and keeps only those that have rows', () => {
    const groups = groupByLevel([step('3', 3), step('1', 1), step('1b', 1)]);
    expect(
      groups.map((group) => [group.approvalLevel, group.rows.length]),
    ).toEqual([
      [1, 2],
      [3, 1],
    ]);
  });

  it('names both people on an override row and tags it', () => {
    render(
      <StepProgress
        steps={[
          step('1', 1, {
            approver: { id: 'a', fullName: 'Điều phối An' },
            action: 'APPROVE',
            isOverride: true,
            kind: 'OVERRIDE',
            performedBy: { id: 'o', fullName: 'Chuyên viên Phòng ĐT' },
            recordedAt: '2026-10-19T03:30:00.000Z',
          }),
        ]}
      />,
    );
    expect(screen.getByText('Phòng Đào tạo duyệt thay')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Người duyệt: Điều phối An · Thực hiện: Chuyên viên Phòng ĐT/,
      ),
    ).toBeInTheDocument();
  });
});
