import {
  BoldOutlined,
  DeleteColumnOutlined,
  DeleteOutlined,
  DeleteRowOutlined,
  InsertRowBelowOutlined,
  InsertRowRightOutlined,
  ItalicOutlined,
  LinkOutlined,
  OrderedListOutlined,
  RedoOutlined,
  StrikethroughOutlined,
  TableOutlined,
  UnderlineOutlined,
  UndoOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import type { Editor } from '@tiptap/react';
import { Button, Flex, Input, Popover, Tooltip } from 'antd';
import { useState, type ReactNode } from 'react';
import styles from './RichText.module.css';
import { RICH_TEXT_LABELS, TABLE_COLS, TABLE_ROWS } from './richTextLabels';

interface ToolbarButtonProps {
  label: string;
  icon: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function ToolbarButton({
  label,
  icon,
  active = false,
  disabled = false,
  onClick,
}: ToolbarButtonProps) {
  return (
    <Tooltip title={label}>
      <Button
        size="small"
        type={active ? 'primary' : 'text'}
        aria-label={label}
        icon={icon}
        disabled={disabled}
        onClick={onClick}
      />
    </Tooltip>
  );
}

interface LinkButtonProps {
  editor: Editor;
  disabled: boolean;
}

// An empty address removes the link, so one field covers both add and remove.
function LinkButton({ editor, disabled }: LinkButtonProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const apply = () => {
    const target = url.trim();
    const chain = editor.chain().focus().extendMarkRange('link');
    if (target === '') chain.unsetLink().run();
    else chain.setLink({ href: target }).run();
    setOpen(false);
  };
  return (
    <Popover
      open={open && !disabled}
      onOpenChange={(next) => {
        setOpen(next);
        if (next)
          setUrl(
            (editor.getAttributes('link') as { href?: string }).href ?? '',
          );
      }}
      trigger="click"
      content={
        <Flex gap="small">
          <Input
            value={url}
            placeholder="https://"
            aria-label={RICH_TEXT_LABELS.linkUrl}
            onChange={(event) => setUrl(event.target.value)}
            onPressEnter={apply}
          />
          <Button type="primary" onClick={apply}>
            {RICH_TEXT_LABELS.linkApply}
          </Button>
        </Flex>
      }
    >
      <Tooltip title={RICH_TEXT_LABELS.link}>
        <Button
          size="small"
          type={editor.isActive('link') ? 'primary' : 'text'}
          aria-label={RICH_TEXT_LABELS.link}
          icon={<LinkOutlined />}
          disabled={disabled}
        />
      </Tooltip>
    </Popover>
  );
}

interface RichTextToolbarProps {
  editor: Editor | null;
  disabled: boolean;
}

export function RichTextToolbar({ editor, disabled }: RichTextToolbarProps) {
  if (!editor) return null;
  const run = () => editor.chain().focus();
  const inTable = editor.isActive('table');
  return (
    <Flex wrap gap={2} className={styles.toolbar} role="toolbar">
      <ToolbarButton
        label={RICH_TEXT_LABELS.bold}
        icon={<BoldOutlined />}
        active={editor.isActive('bold')}
        disabled={disabled}
        onClick={() => run().toggleBold().run()}
      />
      <ToolbarButton
        label={RICH_TEXT_LABELS.italic}
        icon={<ItalicOutlined />}
        active={editor.isActive('italic')}
        disabled={disabled}
        onClick={() => run().toggleItalic().run()}
      />
      <ToolbarButton
        label={RICH_TEXT_LABELS.underline}
        icon={<UnderlineOutlined />}
        active={editor.isActive('underline')}
        disabled={disabled}
        onClick={() => run().toggleUnderline().run()}
      />
      <ToolbarButton
        label={RICH_TEXT_LABELS.strike}
        icon={<StrikethroughOutlined />}
        active={editor.isActive('strike')}
        disabled={disabled}
        onClick={() => run().toggleStrike().run()}
      />
      <ToolbarButton
        label={RICH_TEXT_LABELS.heading3}
        icon="H3"
        active={editor.isActive('heading', { level: 3 })}
        disabled={disabled}
        onClick={() => run().toggleHeading({ level: 3 }).run()}
      />
      <ToolbarButton
        label={RICH_TEXT_LABELS.heading4}
        icon="H4"
        active={editor.isActive('heading', { level: 4 })}
        disabled={disabled}
        onClick={() => run().toggleHeading({ level: 4 }).run()}
      />
      <ToolbarButton
        label={RICH_TEXT_LABELS.bulletList}
        icon={<UnorderedListOutlined />}
        active={editor.isActive('bulletList')}
        disabled={disabled}
        onClick={() => run().toggleBulletList().run()}
      />
      <ToolbarButton
        label={RICH_TEXT_LABELS.orderedList}
        icon={<OrderedListOutlined />}
        active={editor.isActive('orderedList')}
        disabled={disabled}
        onClick={() => run().toggleOrderedList().run()}
      />
      <ToolbarButton
        label={RICH_TEXT_LABELS.blockquote}
        icon="❝"
        active={editor.isActive('blockquote')}
        disabled={disabled}
        onClick={() => run().toggleBlockquote().run()}
      />
      <LinkButton editor={editor} disabled={disabled} />
      <ToolbarButton
        label={RICH_TEXT_LABELS.insertTable}
        icon={<TableOutlined />}
        disabled={disabled}
        onClick={() =>
          run()
            .insertTable({
              rows: TABLE_ROWS,
              cols: TABLE_COLS,
              withHeaderRow: true,
            })
            .run()
        }
      />
      <ToolbarButton
        label={RICH_TEXT_LABELS.addRow}
        icon={<InsertRowBelowOutlined />}
        disabled={disabled || !inTable}
        onClick={() => run().addRowAfter().run()}
      />
      <ToolbarButton
        label={RICH_TEXT_LABELS.addColumn}
        icon={<InsertRowRightOutlined />}
        disabled={disabled || !inTable}
        onClick={() => run().addColumnAfter().run()}
      />
      <ToolbarButton
        label={RICH_TEXT_LABELS.deleteRow}
        icon={<DeleteRowOutlined />}
        disabled={disabled || !inTable}
        onClick={() => run().deleteRow().run()}
      />
      <ToolbarButton
        label={RICH_TEXT_LABELS.deleteColumn}
        icon={<DeleteColumnOutlined />}
        disabled={disabled || !inTable}
        onClick={() => run().deleteColumn().run()}
      />
      <ToolbarButton
        label={RICH_TEXT_LABELS.deleteTable}
        icon={<DeleteOutlined />}
        disabled={disabled || !inTable}
        onClick={() => run().deleteTable().run()}
      />
      <ToolbarButton
        label={RICH_TEXT_LABELS.undo}
        icon={<UndoOutlined />}
        disabled={disabled || !editor.can().undo()}
        onClick={() => run().undo().run()}
      />
      <ToolbarButton
        label={RICH_TEXT_LABELS.redo}
        icon={<RedoOutlined />}
        disabled={disabled || !editor.can().redo()}
        onClick={() => run().redo().run()}
      />
    </Flex>
  );
}
