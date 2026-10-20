const KB = 1024;
const MB = KB * 1024;

// "2,4 MB" the way a Vietnamese reader expects it (decimal comma).
export function formatSize(bytes: number): string {
  if (bytes >= MB) return `${(bytes / MB).toFixed(1).replace('.', ',')} MB`;
  if (bytes >= KB) return `${Math.round(bytes / KB)} KB`;
  return `${bytes} B`;
}
