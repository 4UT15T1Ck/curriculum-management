import { App, Button, Flex, Form } from 'antd';
import { useState } from 'react';
import { RichTextEditor } from '../../../shared/components/rich-text/RichTextEditor';
import {
  applyFieldErrors,
  errorMessage,
} from '../../../shared/forms/applyFieldErrors';
import type { Syllabus, SyllabusSectionField } from '../api/syllabi';
import {
  NOTHING_CHANGED,
  SAVE_SECTIONS,
  SAVED,
  SECTION_LABELS,
} from '../constants/syllabusLabels';
import { useUpdateSyllabus } from '../hooks/useSyllabus';
import type { EditorTabProps } from '../types';
import {
  changedSections,
  SYLLABUS_SECTION_FIELDS,
} from '../utils/syllabusSectionChanges';

type ContentValues = Partial<Record<SyllabusSectionField, string | null>>;

const toContentValues = (syllabus: Syllabus): ContentValues =>
  Object.fromEntries(
    SYLLABUS_SECTION_FIELDS.map((field) => [field, syllabus[field]]),
  );

// Saves only the sections the user changed (D7). The form keeps its own values after a save: the baseline moves to what the
// server stored, so a refetch caused by another tab (weekly rows, files) never overwrites text the user is still typing.
export function SyllabusContentForm({ courseId, syllabus }: EditorTabProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<ContentValues>();
  const update = useUpdateSyllabus(courseId);
  const [baseline, setBaseline] = useState(syllabus);

  const save = (values: ContentValues) => {
    const body = changedSections(baseline, values);
    if (Object.keys(body).length === 0) {
      void message.info(NOTHING_CHANGED);
      return;
    }
    update.mutate(
      { syllabusId: syllabus.id, body },
      {
        onSuccess: (stored) => {
          void message.success(SAVED);
          const sent = Object.keys(body) as SyllabusSectionField[];
          const storedValues = Object.fromEntries(
            sent.map((field) => [field, stored[field]]),
          );
          setBaseline((previous) => ({ ...previous, ...storedValues }));
          form.setFieldsValue(storedValues);
        },
        onError: (reason) => {
          if (!applyFieldErrors(form, reason))
            void message.error(
              errorMessage(reason, 'Không lưu được đề cương.'),
            );
        },
      },
    );
  };

  return (
    <Form<ContentValues>
      form={form}
      layout="vertical"
      initialValues={toContentValues(syllabus)}
      onFinish={save}
    >
      {SYLLABUS_SECTION_FIELDS.map((field) => (
        <Form.Item key={field} name={field} label={SECTION_LABELS[field]}>
          <RichTextEditor aria-label={SECTION_LABELS[field]} />
        </Form.Item>
      ))}
      <Flex justify="end">
        <Button type="primary" htmlType="submit" loading={update.isPending}>
          {SAVE_SECTIONS}
        </Button>
      </Flex>
    </Form>
  );
}
