import type { SyllabusLanguage } from '../constants/syllabusLabels';

export interface TranslatedText {
  text: string | null;
  missing: boolean;
}

// English mode falls back to Vietnamese and flags the gap; Vietnamese mode never flags.
export function translated(
  language: SyllabusLanguage,
  vietnamese: string | null,
  english: string | null,
): TranslatedText {
  if (language === 'vi') return { text: vietnamese, missing: false };
  return english
    ? { text: english, missing: false }
    : { text: vietnamese, missing: vietnamese !== null };
}
