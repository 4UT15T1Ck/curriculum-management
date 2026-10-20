import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import { useEffect } from 'react';
import styles from './RichText.module.css';
import { RICH_TEXT_EXTENSIONS } from './richTextExtensions';
import { RichTextToolbar } from './RichTextToolbar';

interface RichTextEditorProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  disabled?: boolean;
  'aria-label': string;
  // Test hook: hands the TipTap instance to the caller once it exists.
  onReady?: (editor: Editor) => void;
}

// A controlled form control for AntD Form.Item: the value is an HTML string, or null when the editor is empty.
export function RichTextEditor({
  value = null,
  onChange,
  disabled = false,
  'aria-label': ariaLabel,
  onReady,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: RICH_TEXT_EXTENSIONS,
    content: value ?? '',
    editable: !disabled,
    editorProps: {
      attributes: {
        'aria-label': ariaLabel,
        role: 'textbox',
        'aria-multiline': 'true',
      },
    },
    onUpdate: ({ editor: current }) =>
      onChange?.(current.isEmpty ? null : current.getHTML()),
  });

  // A form reset or a refetch replaces the value from outside; skip it when it is the editor's own echo.
  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? null : editor.getHTML();
    if (current !== value)
      editor.commands.setContent(value ?? '', { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (editor) onReady?.(editor);
  }, [editor, onReady]);

  return (
    <div className={styles.editor}>
      <RichTextToolbar editor={editor} disabled={disabled} />
      <EditorContent
        editor={editor}
        className={`${styles.editorBody} ${styles.richText}`}
      />
    </div>
  );
}
