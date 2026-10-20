import { App, Button, Card, Form, Input, List, Typography } from 'antd';
import { errorMessage } from '../../../shared/forms/applyFieldErrors';
import { COMMENT_MAX } from '../constants/approvalLimits';
import { useComments, useCreateComment } from '../hooks/useApprovals';
import { formatDateTime } from '../utils/format';

interface CommentsCardProps {
  requestId: string;
  canComment: boolean;
}

// US-067: plain text, oldest first, no edit or delete; a comment never changes the request.
export function CommentsCard({ requestId, canComment }: CommentsCardProps) {
  const { message } = App.useApp();
  const { data, isLoading } = useComments(requestId);
  const create = useCreateComment(requestId);
  const [form] = Form.useForm<{ content: string }>();
  return (
    <Card size="small" title="Bình luận">
      <List
        loading={isLoading}
        dataSource={data ?? []}
        locale={{ emptyText: 'Chưa có bình luận.' }}
        renderItem={(comment) => (
          <List.Item>
            <List.Item.Meta
              title={`${comment.author.fullName} · ${formatDateTime(comment.createdAt)}`}
              description={
                <Typography.Paragraph
                  style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}
                >
                  {comment.content}
                </Typography.Paragraph>
              }
            />
          </List.Item>
        )}
      />
      {canComment && (
        <Form
          form={form}
          onFinish={({ content }) =>
            create.mutateAsync(content.trim()).then(
              () => form.resetFields(),
              (error: unknown) =>
                void message.error(
                  errorMessage(error, 'Không gửi được bình luận.'),
                ),
            )
          }
        >
          <Form.Item
            name="content"
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'Nhập nội dung bình luận.',
              },
            ]}
          >
            <Input.TextArea
              rows={3}
              maxLength={COMMENT_MAX}
              showCount
              aria-label="Nội dung bình luận"
            />
          </Form.Item>
          <Button htmlType="submit" loading={create.isPending}>
            Gửi bình luận
          </Button>
        </Form>
      )}
    </Card>
  );
}
