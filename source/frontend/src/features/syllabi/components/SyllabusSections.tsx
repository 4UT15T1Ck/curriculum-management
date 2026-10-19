import { Flex, Space, Tag, Typography } from 'antd';
import { RichTextView } from '../../../shared/components/rich-text/RichTextView';
import type { Syllabus, SyllabusSectionField } from '../api/syllabi';
import {
  ATTACHMENTS_SECTION_LABEL,
  EMPTY_SECTION,
  NOT_TRANSLATED,
  SECTION_LABELS,
  WEEKLY_SECTION_LABEL,
  type SyllabusLanguage,
} from '../constants/syllabusLabels';
import { formatDate, formatDateTime } from '../utils/formatDateTime';
import { translated } from '../utils/syllabusLanguage';
import { AttachmentList } from './AttachmentList';
import { WeeklyContentView } from './WeeklyContentView';

interface SyllabusSectionsProps {
  syllabus: Syllabus;
  language: SyllabusLanguage;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  untranslated?: boolean;
}

function Section({ title, children, untranslated = false }: SectionProps) {
  return (
    <section>
      <Space>
        <Typography.Title level={5}>{title}</Typography.Title>
        {untranslated && <Tag>{NOT_TRANSLATED}</Tag>}
      </Space>
      {children}
    </section>
  );
}

// Only the course name and the description have an English field (FR-48); the other sections show Vietnamese in both modes.
export function SyllabusSections({
  syllabus,
  language,
}: SyllabusSectionsProps) {
  const description = translated(
    language,
    syllabus.courseDescription,
    syllabus.englishDescription,
  );
  const plain = (field: SyllabusSectionField) => (
    <Section title={SECTION_LABELS[field]}>
      <RichTextView html={syllabus[field]} emptyText={EMPTY_SECTION} />
    </Section>
  );
  return (
    <Flex vertical gap="middle">
      <Typography.Text type="secondary">
        {`Bản số ${syllabus.revisionNumber} · Cập nhật lúc ${formatDateTime(syllabus.updatedAt)}`}
        {syllabus.publishedAt &&
          ` · Ban hành ngày ${formatDate(syllabus.publishedAt)}`}
      </Typography.Text>
      <Section
        title={SECTION_LABELS.courseDescription}
        untranslated={description.missing}
      >
        <RichTextView html={description.text} emptyText={EMPTY_SECTION} />
      </Section>
      {plain('objectives')}
      <Section title={WEEKLY_SECTION_LABEL}>
        <WeeklyContentView weeks={syllabus.weeklyContents} />
      </Section>
      {plain('teachingMethods')}
      {plain('assessmentMethods')}
      {plain('references')}
      <Section title={ATTACHMENTS_SECTION_LABEL}>
        <AttachmentList attachments={syllabus.attachments} />
      </Section>
    </Flex>
  );
}
