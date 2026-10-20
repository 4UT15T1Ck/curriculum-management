import { App, Input, Typography } from 'antd';
import { useState } from 'react';
import { errorMessage } from '../../../shared/forms/applyFieldErrors';
import type { CoursePloCell } from '../api/outcomes';
import { cellClearConfirm, WEIGHT_MESSAGE } from '../constants/outcomeLabels';
import { useRemovePloWeight, useSetPloWeight } from '../hooks/useOutcomes';
import { formatWeight, isValidWeight, normalizeWeight } from '../weight';

interface WeightCellProps {
  itemId: string;
  ploId: string;
  cell: CoursePloCell | undefined;
  canEdit: boolean;
}

// Read mode prints the weight. A click opens one Input (only one cell is ever an Input, so 200 x 30 cells stay cheap);
// Enter or leaving the field saves, Escape cancels, and an empty field clears a filled cell.
export function WeightCell({ itemId, ploId, cell, canEdit }: WeightCellProps) {
  const { message, modal } = App.useApp();
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const setWeight = useSetPloWeight();
  const removeWeight = useRemovePloWeight();

  const fail = (reason: unknown, fallback: string) =>
    void message.error(errorMessage(reason, fallback));
  const close = () => {
    setDraft(null);
    setInvalid(false);
  };

  const clear = () => {
    if (!cell) return close();
    const run = () =>
      removeWeight.mutate(
        { itemId, ploId },
        { onError: (reason) => fail(reason, 'Không xóa được ô.') },
      );
    close();
    if (cell.cloLinkCount > 0)
      modal.confirm({
        title: 'Xóa ô học phần–PLO?',
        content: cellClearConfirm(cell.cloLinkCount),
        okText: 'Xóa',
        cancelText: 'Hủy',
        okButtonProps: { danger: true },
        onOk: run,
      });
    else run();
  };

  const commit = () => {
    const text = (draft ?? '').trim();
    if (text === '') return clear();
    if (!isValidWeight(text)) return setInvalid(true);
    const weight = normalizeWeight(text);
    close();
    if (cell && Number(cell.weight) === Number(weight)) return;
    setWeight.mutate(
      { itemId, ploId, weight },
      { onError: (reason) => fail(reason, 'Không lưu được trọng số.') },
    );
  };

  if (draft !== null)
    return (
      <div>
        <Input
          autoFocus
          size="small"
          inputMode="decimal"
          aria-label="Trọng số"
          status={invalid ? 'error' : undefined}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setInvalid(false);
          }}
          onPressEnter={commit}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Escape') close();
          }}
        />
        {invalid && (
          <Typography.Text type="danger" role="alert">
            {WEIGHT_MESSAGE}
          </Typography.Text>
        )}
      </div>
    );
  const text = cell ? formatWeight(cell.weight) : '';
  if (!canEdit) return <span>{text}</span>;
  return (
    <Typography.Link
      aria-label={cell ? `Trọng số ${text}` : 'Nhập trọng số'}
      onClick={() => setDraft(cell ? text : '')}
    >
      {text || '＋'}
    </Typography.Link>
  );
}
