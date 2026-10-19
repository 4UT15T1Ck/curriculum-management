import type { CloPloLink } from './api/outcomes';

// The ticked (CLO, PLO) pairs of one course's grid, as "cloId:ploId" keys.
export type CloPloSelection = ReadonlySet<string>;

const SEPARATOR = ':';
const keyOf = (cloId: string, ploId: string) => `${cloId}${SEPARATOR}${ploId}`;

export const fromLinks = (links: readonly CloPloLink[]): CloPloSelection =>
  new Set(links.map((link) => keyOf(link.cloId, link.ploId)));

export const isSelected = (
  selection: CloPloSelection,
  cloId: string,
  ploId: string,
) => selection.has(keyOf(cloId, ploId));

export function toggle(
  selection: CloPloSelection,
  cloId: string,
  ploId: string,
): CloPloSelection {
  const next = new Set(selection);
  const key = keyOf(cloId, ploId);
  if (!next.delete(key)) next.add(key);
  return next;
}

export const toPairs = (selection: CloPloSelection): CloPloLink[] =>
  [...selection].map((key) => {
    const [cloId, ploId] = key.split(SEPARATOR);
    return { cloId, ploId };
  });

export function isDirty(
  selection: CloPloSelection,
  links: readonly CloPloLink[],
): boolean {
  const saved = fromLinks(links);
  return (
    saved.size !== selection.size || [...selection].some((k) => !saved.has(k))
  );
}
