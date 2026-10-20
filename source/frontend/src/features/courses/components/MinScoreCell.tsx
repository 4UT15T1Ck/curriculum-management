import { App, Button, Input, Space } from 'antd';
import { useState } from 'react';
import { errorMessage } from '../../../shared/forms/applyFieldErrors';
import type { CourseRelation } from '../api/courseRelations';
import { useUpdateRelationMinScore } from '../hooks/useCourseRelations';
import {
  GRADE_POINT_MESSAGE,
  GRADE_POINT_PATTERN,
} from '../schema/courseRules';

interface MinScoreCellProps {
  relation: CourseRelation;
}

const EMPTY = '—';

// The threshold exists on prerequisites only; it is editable in place when the server says the caller may edit directly.
export function MinScoreCell({ relation }: MinScoreCellProps) {
  const { message } = App.useApp();
  const update = useUpdateRelationMinScore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  if (relation.relationType !== 'PREREQUISITE') return null;
  const shown = relation.minScore ?? EMPTY;
  if (!editing)
    return (
      <Space>
        {shown}
        {relation.editPath === 'DIRECT' && (
          <Button
            type="link"
            size="small"
            aria-label="Sửa ngưỡng điểm"
            onClick={() => {
              setDraft(relation.minScore ?? '');
              setEditing(true);
            }}
          >
            Sửa
          </Button>
        )}
      </Space>
    );
  const save = () => {
    const value = draft.trim();
    if (value !== '' && !GRADE_POINT_PATTERN.test(value)) {
      void message.error(GRADE_POINT_MESSAGE);
      return;
    }
    update.mutate(
      { relationId: relation.id, minScore: value === '' ? null : value },
      {
        onSuccess: () => setEditing(false),
        onError: (error) =>
          void message.error(
            errorMessage(error, 'Không lưu được ngưỡng điểm.'),
          ),
      },
    );
  };
  return (
    <Space.Compact>
      <Input
        aria-label="Ngưỡng điểm"
        inputMode="decimal"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onPressEnter={save}
        style={{ width: 90 }}
      />
      <Button type="primary" loading={update.isPending} onClick={save}>
        Lưu
      </Button>
      <Button onClick={() => setEditing(false)}>Hủy</Button>
    </Space.Compact>
  );
}
