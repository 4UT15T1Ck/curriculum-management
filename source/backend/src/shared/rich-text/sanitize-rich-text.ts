import sanitizeHtml from 'sanitize-html';

// Must match the tags the client editor can produce (RichTextEditor); anything else is dropped, its text kept.
export const RICH_TEXT_POLICY: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'br',
    'hr',
    'strong',
    'em',
    'u',
    's',
    'code',
    'pre',
    'ul',
    'ol',
    'li',
    'h3',
    'h4',
    'blockquote',
    'table',
    'colgroup',
    'col',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'a',
  ],
  allowedAttributes: {
    a: ['href', 'rel', 'target'],
    th: ['colspan', 'rowspan', 'colwidth'],
    td: ['colspan', 'rowspan', 'colwidth'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  transformTags: {
    a: sanitizeHtml.simpleTransform(
      'a',
      { rel: 'noopener noreferrer nofollow', target: '_blank' },
      true,
    ),
  },
};

const NO_MARKUP: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
};
const NBSP = /&nbsp;|\u00a0/g;

// Stored HTML is escaped text (`a < b` becomes `a &lt; b`); never sanitize twice on read.
// Text that is empty once markup and spaces are gone is stored as null, so "empty section" has one shape.
export function sanitizeRichText(
  html: string | null | undefined,
): string | null {
  if (html === null || html === undefined) {
    return null;
  }
  const clean = sanitizeHtml(html, RICH_TEXT_POLICY).trim();
  const text = sanitizeHtml(clean, NO_MARKUP).replace(NBSP, ' ').trim();
  return text === '' ? null : clean;
}
