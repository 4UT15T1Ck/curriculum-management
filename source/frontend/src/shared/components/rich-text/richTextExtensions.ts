import { TableKit } from '@tiptap/extension-table';
import StarterKit from '@tiptap/starter-kit';

// Keep in step with RICH_TEXT_POLICY in the backend (src/shared/rich-text/sanitize-rich-text.ts):
// a node the server drops is lost on save.
const HEADING_LEVELS = [3, 4];
const LINK_PROTOCOLS = ['http', 'https', 'mailto'];

export const RICH_TEXT_EXTENSIONS = [
  StarterKit.configure({
    heading: { levels: HEADING_LEVELS as (3 | 4)[] },
    link: {
      openOnClick: false,
      autolink: true,
      protocols: LINK_PROTOCOLS,
      defaultProtocol: 'https',
    },
  }),
  TableKit.configure({ table: { resizable: false } }),
];
