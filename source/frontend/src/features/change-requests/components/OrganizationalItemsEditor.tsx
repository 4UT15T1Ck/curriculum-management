import dayjs from 'dayjs';
import {
  App,
  Button,
  Card,
  DatePicker,
  Flex,
  Form,
  Input,
  Modal,
  Select,
  Skeleton,
  Table,
  Tag,
} from 'antd';
import { useState } from 'react';
import { errorMessage } from '../../../shared/forms/applyFieldErrors';
import { UserSelect } from '../../../shared/users/UserSelect';
import { DATE_FORMAT, ISO_DAY_FORMAT } from '../../../shared/validity/validity';
import {
  USER_OPTIONS_PATH,
  type AuthoredItemInput,
  type ChangeRequestDetail,
} from '../api/changeRequests';
import {
  useGroupDetail,
  useProgramDirectors,
  useReplaceAuthoredItems,
} from '../hooks/useChangeRequests';
import { payloadOf } from '../types';

interface OrganizationalItemsEditorProps {
  request: ChangeRequestDetail;
}

const MEMBER_ROLE_LABELS = {
  MEMBER: 'Thành viên',
  COORDINATOR: 'Điều phối',
} as const;
const SAVED = 'Đã lưu các thay đổi.';

type Addition = Extract<
  AuthoredItemInput,
  { operation: 'ADD_MEMBER' | 'ASSIGN_DIRECTOR' }
>;
interface PendingAddition {
  input: Addition;
  // What the list shows: the picked person's "CODE — name", or the stored item's own label after a reload.
  text: string;
}

type Ending = Extract<
  AuthoredItemInput,
  { operation: 'END_MEMBERSHIP' | 'END_DIRECTOR' }
>;

interface Row {
  id: string;
  name: string;
  role?: string;
  validFrom: string;
  validTo: string | null;
}

const formatDay = (iso: string | null) =>
  iso ? dayjs(iso).format(DATE_FORMAT) : 'không thời hạn';

// ORGANIZATION requests (US-060): members of a subject group, or directors of a program, added and ended as items.
export function OrganizationalItemsEditor({
  request,
}: OrganizationalItemsEditorProps) {
  const isGroup = request.target.targetType === 'SUBJECT_GROUP';
  const group = useGroupDetail(isGroup ? request.target.id : '');
  const directors = useProgramDirectors(isGroup ? '' : request.target.id);
  if (isGroup && !group.data) return <Skeleton active />;
  if (!isGroup && !directors.data) return <Skeleton active />;
  const rows: Row[] = isGroup
    ? (group.data?.members ?? [])
        .filter(
          (member) => member.state === 'ACTIVE' || member.state === 'SCHEDULED',
        )
        .map((member) => ({
          id: member.id,
          name: member.lecturer.fullName,
          role: MEMBER_ROLE_LABELS[member.memberRole],
          validFrom: member.validFrom,
          validTo: member.validTo,
        }))
    : (directors.data ?? [])
        .filter((row) => row.state === 'ACTIVE' || row.state === 'SCHEDULED')
        .map((row) => ({
          id: row.id,
          name: row.director.fullName,
          validFrom: row.validFrom,
          validTo: row.validTo,
        }));
  return <Editor request={request} isGroup={isGroup} rows={rows} />;
}

interface EditorProps {
  request: ChangeRequestDetail;
  isGroup: boolean;
  rows: Row[];
}

function initialState(request: ChangeRequestDetail) {
  const endings: Record<string, string> = {};
  const additions: PendingAddition[] = [];
  for (const item of request.authoredItems) {
    const payload = payloadOf(item);
    if (payload?.operation === 'END_MEMBERSHIP')
      endings[payload.memberRowId] = payload.validTo;
    else if (payload?.operation === 'END_DIRECTOR')
      endings[payload.assignmentId] = payload.validTo;
    else if (
      payload?.operation === 'ADD_MEMBER' ||
      payload?.operation === 'ASSIGN_DIRECTOR'
    )
      additions.push({ input: payload, text: item.label });
  }
  return { endings, additions };
}

function Editor({ request, isGroup, rows }: EditorProps) {
  const { message } = App.useApp();
  const save = useReplaceAuthoredItems(request.id);
  const [{ endings, additions }, setState] = useState(() =>
    initialState(request),
  );
  const [ending, setEnding] = useState<Row | null>(null);
  const [adding, setAdding] = useState(false);
  const editable = request.permissions.canEdit;
  const setEndings = (next: Record<string, string>) =>
    setState((current) => ({ ...current, endings: next }));

  const onSave = () => {
    const ends: Ending[] = Object.entries(endings).map(([id, validTo]) =>
      isGroup
        ? { operation: 'END_MEMBERSHIP', memberRowId: id, validTo }
        : { operation: 'END_DIRECTOR', assignmentId: id, validTo },
    );
    save.mutate([...ends, ...additions.map((entry) => entry.input)], {
      onSuccess: () => void message.success(SAVED),
      onError: (error) =>
        void message.error(errorMessage(error, 'Không lưu được các thay đổi.')),
    });
  };

  return (
    <Flex vertical gap="middle">
      <Card
        title={isGroup ? 'Thành viên hiện tại' : 'Giám đốc CTĐT hiện tại'}
        extra={
          editable && (
            <Button onClick={() => setAdding(true)}>
              {isGroup ? 'Thêm thành viên' : 'Phân công Giám đốc CTĐT'}
            </Button>
          )
        }
      >
        <Table<Row>
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={rows}
          locale={{ emptyText: 'Chưa có ai' }}
          columns={[
            { title: 'Họ tên', dataIndex: 'name' },
            ...(isGroup ? [{ title: 'Vai trò', dataIndex: 'role' }] : []),
            {
              title: 'Hiệu lực',
              render: (_v, row) =>
                `${formatDay(row.validFrom)} – ${formatDay(row.validTo)}`,
            },
            {
              title: 'Thao tác',
              render: (_v, row) => {
                const endDay = endings[row.id];
                if (endDay)
                  return (
                    <Flex gap="small" align="center">
                      <Tag color="error">Kết thúc {formatDay(endDay)}</Tag>
                      {editable && (
                        <Button
                          type="link"
                          size="small"
                          onClick={() => {
                            const { [row.id]: _removed, ...rest } = endings;
                            setEndings(rest);
                          }}
                        >
                          Hoàn tác
                        </Button>
                      )}
                    </Flex>
                  );
                return (
                  editable && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => setEnding(row)}
                    >
                      Kết thúc
                    </Button>
                  )
                );
              },
            },
          ]}
        />
      </Card>
      {additions.length > 0 && (
        <Card title="Thêm mới">
          <Table<PendingAddition>
            size="small"
            rowKey={(entry) => JSON.stringify(entry.input)}
            pagination={false}
            dataSource={additions}
            columns={[
              { title: 'Nội dung', dataIndex: 'text' },
              ...(isGroup
                ? [
                    {
                      title: 'Vai trò',
                      render: (_v: unknown, entry: PendingAddition) =>
                        entry.input.operation === 'ADD_MEMBER'
                          ? MEMBER_ROLE_LABELS[entry.input.memberRole]
                          : null,
                    },
                  ]
                : []),
              {
                title: 'Hiệu lực',
                render: (_v, entry) =>
                  `${formatDay(entry.input.validFrom)} – ${formatDay(entry.input.validTo)}`,
              },
              {
                title: 'Thao tác',
                render: (_v, _entry, index) =>
                  editable && (
                    <Button
                      type="link"
                      danger
                      size="small"
                      onClick={() =>
                        setState((current) => ({
                          ...current,
                          additions: current.additions.filter(
                            (_x, at) => at !== index,
                          ),
                        }))
                      }
                    >
                      Bỏ
                    </Button>
                  ),
              },
            ]}
          />
        </Card>
      )}
      {editable && (
        <Flex>
          <Button type="primary" onClick={onSave} loading={save.isPending}>
            Lưu thay đổi
          </Button>
        </Flex>
      )}
      {ending && (
        <EndModal
          row={ending}
          onClose={() => setEnding(null)}
          onEnd={(validTo) => {
            setEndings({ ...endings, [ending.id]: validTo });
            setEnding(null);
          }}
        />
      )}
      {adding && (
        <AddModal
          isGroup={isGroup}
          onClose={() => setAdding(false)}
          onAdd={(addition) => {
            setState((current) => ({
              ...current,
              additions: [...current.additions, addition],
            }));
            setAdding(false);
          }}
        />
      )}
    </Flex>
  );
}

interface EndModalProps {
  row: Row;
  onClose: () => void;
  onEnd: (validTo: string) => void;
}

function EndModal({ row, onClose, onEnd }: EndModalProps) {
  const [form] = Form.useForm<{ validTo: dayjs.Dayjs }>();
  return (
    <Modal
      open
      title={`Kết thúc — ${row.name}`}
      okText="Đồng ý"
      cancelText="Hủy"
      onCancel={onClose}
      onOk={() => form.submit()}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ validTo: dayjs() }}
        onFinish={({ validTo }) => onEnd(validTo.format(ISO_DAY_FORMAT))}
      >
        <Form.Item
          name="validTo"
          label="Ngày kết thúc"
          rules={[{ required: true, message: 'Chọn ngày kết thúc.' }]}
        >
          <DatePicker
            format={ISO_DAY_FORMAT}
            disabledDate={(date) => date.isBefore(dayjs(row.validFrom), 'day')}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

interface AddModalProps {
  isGroup: boolean;
  onClose: () => void;
  onAdd: (addition: PendingAddition) => void;
}

interface AddValues {
  userId: string;
  userText?: string;
  memberRole: 'MEMBER' | 'COORDINATOR';
  validFrom: dayjs.Dayjs;
  validTo?: dayjs.Dayjs | null;
}

function AddModal({ isGroup, onClose, onAdd }: AddModalProps) {
  const [form] = Form.useForm<AddValues>();
  const onFinish = (values: AddValues) => {
    const validFrom = values.validFrom.format(ISO_DAY_FORMAT);
    const validTo = values.validTo
      ? values.validTo.format(ISO_DAY_FORMAT)
      : null;
    const input: Addition = isGroup
      ? {
          operation: 'ADD_MEMBER',
          lecturerId: values.userId,
          memberRole: values.memberRole,
          validFrom,
          validTo,
        }
      : {
          operation: 'ASSIGN_DIRECTOR',
          directorId: values.userId,
          validFrom,
          validTo,
        };
    onAdd({ input, text: values.userText ?? values.userId });
  };
  return (
    <Modal
      open
      title={isGroup ? 'Thêm thành viên' : 'Phân công Giám đốc CTĐT'}
      okText="Thêm"
      cancelText="Hủy"
      onCancel={onClose}
      onOk={() => form.submit()}
    >
      <Form<AddValues>
        form={form}
        layout="vertical"
        initialValues={{ memberRole: 'MEMBER', validFrom: dayjs() }}
        onFinish={onFinish}
      >
        <Form.Item
          name="userId"
          label="Người dùng"
          rules={[{ required: true, message: 'Chọn người dùng.' }]}
        >
          <UserSelect
            searchPath={USER_OPTIONS_PATH}
            onPick={(_id, label) => form.setFieldsValue({ userText: label })}
          />
        </Form.Item>
        <Form.Item name="userText" hidden>
          <Input />
        </Form.Item>
        {isGroup && (
          <Form.Item name="memberRole" label="Vai trò">
            <Select
              options={Object.entries(MEMBER_ROLE_LABELS).map(
                ([value, label]) => ({ value, label }),
              )}
            />
          </Form.Item>
        )}
        <Form.Item
          name="validFrom"
          label="Từ ngày"
          rules={[{ required: true, message: 'Chọn ngày bắt đầu.' }]}
        >
          <DatePicker format={ISO_DAY_FORMAT} />
        </Form.Item>
        <Form.Item name="validTo" label="Đến ngày (không bắt buộc)">
          <DatePicker format={ISO_DAY_FORMAT} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
