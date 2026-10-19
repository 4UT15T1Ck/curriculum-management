import { Typography } from 'antd';
import styles from './RichText.module.css';

interface RichTextViewProps {
  html: string | null;
  emptyText: string;
}

// The one place stored rich text becomes markup. The server sanitizes every write
// (backend src/shared/rich-text/sanitize-rich-text.ts), so only stored HTML reaches this component.
export function RichTextView({ html, emptyText }: RichTextViewProps) {
  if (!html) {
    return <Typography.Text type="secondary">{emptyText}</Typography.Text>;
  }
  return (
    // oxlint-disable-next-line react/no-danger -- server-sanitized HTML, allowlist in sanitize-rich-text.ts
    <div
      className={styles.richText}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
