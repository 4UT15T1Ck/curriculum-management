// A Draft has no version number yet. Shared because the programs, curriculum and courses screens all print it.
export const DRAFT_VERSION_LABEL = 'Nháp';
export const versionLabel = (version: { versionNumber: string | null }) =>
  version.versionNumber ?? DRAFT_VERSION_LABEL;
