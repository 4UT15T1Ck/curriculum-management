import sanitizeHtml from 'sanitize-html';

const BLOCK_END = /<\/(p|li|tr|h3|h4|blockquote|pre)>|<br\s*\/?>|<hr\s*\/?>/gi;
const CELL_END = /<\/t[dh]>/gi;
const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
};
const ENTITY = /&(amp|lt|gt|quot|#39|nbsp);/g;
const BLANK_LINES = /\n{3,}/g;

// Stored rich text as readable text, for places that cannot show markup (the request diff).
export function richTextToPlain(html: string | null): string | null {
  if (html === null) return null;
  const spaced = html.replace(BLOCK_END, '\n').replace(CELL_END, ' | ');
  const stripped = sanitizeHtml(spaced, {
    allowedTags: [],
    allowedAttributes: {},
  });
  const text = stripped
    .replace(ENTITY, (entity) => ENTITIES[entity] ?? entity)
    .replace(BLANK_LINES, '\n\n')
    .trim();
  return text === '' ? null : text;
}
