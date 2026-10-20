import { Checkbox, Table, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import type { CloRef, ItemCloPloMatrix } from '../api/outcomes';
import { PLO_NOT_MAPPED_HINT } from '../constants/outcomeLabels';
import { isSelected, type CloPloSelection } from '../cloPloSelection';
import { formatWeight } from '../weight';

interface CloPloGridProps {
  matrix: ItemCloPloMatrix;
  selection: CloPloSelection;
  disabled: boolean;
  onToggle: (cloId: string, ploId: string) => void;
}

// Rows are the CLOs of the course's current syllabus, columns the program's PLOs. A column is checkable only when
// the course already maps that PLO (it has a weight); there is no level to pick (F11-03).
export function CloPloGrid({
  matrix,
  selection,
  disabled,
  onToggle,
}: CloPloGridProps) {
  const columns: TableColumnsType<CloRef> = [
    {
      title: 'CLO',
      fixed: 'left',
      width: 320,
      render: (_value, clo) => `${clo.cloCode} — ${clo.description}`,
    },
    ...matrix.plos.map((plo) => {
      const mapped = plo.weight !== null;
      return {
        key: plo.id,
        width: 100,
        title: (
          <Tooltip title={mapped ? plo.description : PLO_NOT_MAPPED_HINT}>
            <span>
              {plo.ploCode}
              {mapped && ` (${formatWeight(plo.weight!)})`}
            </span>
          </Tooltip>
        ),
        render: (_value: unknown, clo: CloRef) => (
          <Checkbox
            aria-label={`${clo.cloCode} – ${plo.ploCode}`}
            checked={isSelected(selection, clo.id, plo.id)}
            disabled={disabled || !mapped}
            onChange={() => onToggle(clo.id, plo.id)}
          />
        ),
      };
    }),
  ];
  return (
    <Table<CloRef>
      size="small"
      rowKey="id"
      pagination={false}
      columns={columns}
      dataSource={matrix.clos}
      scroll={{ x: 'max-content' }}
    />
  );
}
