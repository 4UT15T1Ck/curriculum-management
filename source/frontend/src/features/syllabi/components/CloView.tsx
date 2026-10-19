import { Table, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import type { Clo } from '../api/syllabi';
import {
  NO_CLOS,
  NOT_TRANSLATED,
  type SyllabusLanguage,
} from '../constants/syllabusLabels';
import { translated } from '../utils/syllabusLanguage';

interface CloViewProps {
  clos: Clo[];
  language: SyllabusLanguage;
}

// FR-48: the toggle switches the CLO description; a CLO without an English text falls back to Vietnamese and is flagged.
export function CloView({ clos, language }: CloViewProps) {
  if (clos.length === 0)
    return <Typography.Text type="secondary">{NO_CLOS}</Typography.Text>;
  const columns: TableColumnsType<Clo> = [
    { title: 'Mã', dataIndex: 'cloCode', width: 90 },
    {
      title: 'Mô tả',
      render: (_value, clo) => {
        const text = translated(
          language,
          clo.description,
          clo.englishDescription,
        );
        return (
          <>
            {text.text}
            {text.missing && <Tag>{NOT_TRANSLATED}</Tag>}
          </>
        );
      },
    },
    {
      title: 'Mức nhận thức',
      dataIndex: 'cognitiveLevel',
      width: 130,
      render: (value: string | null) => value ?? '—',
    },
  ];
  return (
    <Table<Clo>
      size="small"
      rowKey="id"
      pagination={false}
      columns={columns}
      dataSource={clos}
    />
  );
}
