import { Alert, Flex, Result, Skeleton, Tabs, Tooltip, Typography } from 'antd';
import { useState } from 'react';
import { generatePath, Link, useParams, useSearchParams } from 'react-router';
import { ROUTES } from '../../../routes';
import { ApiError } from '../../../shared/api/client';
import {
  REQUEST_ID_PARAM,
  TAB_PARAM,
} from '../../../shared/change-requests/requestParams';
import { RequestDraftBanner } from '../../../shared/change-requests/RequestDraftBanner';
import { ProgramsUsingList } from '../../../shared/courses/ProgramsUsingList';
import { AttachmentPanel } from '../components/AttachmentPanel';
import { CloTab } from '../components/CloTab';
import { SyllabusContentForm } from '../components/SyllabusContentForm';
import { WeeklyContentTable } from '../components/WeeklyContentTable';
import {
  BACK_TO_SYLLABUS,
  CLO_TAB_DISABLED_TOOLTIP,
  EDITOR_TAB_LABELS,
  NOT_DIRECTLY_EDITABLE,
  PROGRAMS_USING_NOTICE,
} from '../constants/syllabusLabels';
import { useCourseSyllabus } from '../hooks/useSyllabus';
import type { EditorTabProps } from '../types';

// The order users see; F-12 appends the grading formula and mapping tabs after the CLO tab.
const EDITOR_TABS = [
  {
    key: 'content',
    label: EDITOR_TAB_LABELS.content,
    render: (props: EditorTabProps) => <SyllabusContentForm {...props} />,
  },
  {
    key: 'weekly',
    label: EDITOR_TAB_LABELS.weekly,
    render: (props: EditorTabProps) => <WeeklyContentTable {...props} />,
  },
  {
    key: 'attachments',
    label: EDITOR_TAB_LABELS.attachments,
    render: (props: EditorTabProps) => <AttachmentPanel {...props} />,
  },
  {
    key: 'clos',
    label: EDITOR_TAB_LABELS.clos,
    render: (props: EditorTabProps) => <CloTab {...props} />,
    // CLOs are written with clo.edit, not syllabus.edit; the tab stays visible but off without it.
    enabled: (props: EditorTabProps) => props.canEditClos,
    disabledHint: CLO_TAB_DISABLED_TOOLTIP,
  },
] satisfies readonly EditorTab[];

interface EditorTab {
  key: string;
  label: string;
  render: (props: EditorTabProps) => React.ReactNode;
  enabled?: (props: EditorTabProps) => boolean;
  disabledHint?: string;
}

export function SyllabusEditorPage() {
  const { courseId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get(REQUEST_ID_PARAM) ?? undefined;
  const initialTab = searchParams.get(TAB_PARAM) ?? EDITOR_TABS[0].key;
  const [activeTab, setActiveTab] = useState(initialTab);
  const { data, isPending, error } = useCourseSyllabus(courseId, requestId);
  if (isPending) return <Skeleton active />;
  if (!data) {
    if (error instanceof ApiError && error.status === 403)
      return (
        <Result status="403" title="Bạn không có quyền sửa đề cương này" />
      );
    return <Result status="404" title="Không tìm thấy học phần" />;
  }
  const {
    course,
    draft,
    editPath,
    programsUsing,
    attachmentRules,
    canEditClos,
  } = data;
  const backBase = generatePath(ROUTES.syllabus, { courseId });
  const backLink = requestId
    ? `${backBase}?${REQUEST_ID_PARAM}=${encodeURIComponent(requestId)}`
    : backBase;
  if (!draft || editPath !== 'DIRECT')
    return (
      <Result
        status="info"
        title={NOT_DIRECTLY_EDITABLE}
        extra={<Link to={backLink}>{BACK_TO_SYLLABUS}</Link>}
      />
    );
  const tabProps: EditorTabProps = {
    courseId,
    syllabus: draft,
    attachmentRules,
    canEditClos,
  };
  return (
    <Flex vertical gap="middle">
      <Flex justify="space-between" align="center" wrap gap="small">
        <Typography.Title level={2} style={{ margin: 0 }}>
          Sửa đề cương — {course.courseCode} {course.courseName}
        </Typography.Title>
        <Link to={backLink}>{BACK_TO_SYLLABUS}</Link>
      </Flex>
      <RequestDraftBanner request={draft.sourceRequest} />
      <Alert
        type="info"
        showIcon
        title={PROGRAMS_USING_NOTICE}
        description={<ProgramsUsingList programs={programsUsing} />}
      />
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={EDITOR_TABS.filter(
          // A request's copy carries no attachments; the request has its own documents.
          (tab) => !(draft.sourceRequest && tab.key === 'attachments'),
        ).map((tab: EditorTab) => {
          const disabled = tab.enabled ? !tab.enabled(tabProps) : false;
          return {
            key: tab.key,
            label: disabled ? (
              <Tooltip title={tab.disabledHint}>{tab.label}</Tooltip>
            ) : (
              tab.label
            ),
            disabled,
            children: disabled ? null : tab.render(tabProps),
          };
        })}
      />
    </Flex>
  );
}
