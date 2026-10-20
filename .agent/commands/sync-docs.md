---
description: Sync project docs to the current code, then reset the docs-sync change counter.
---

The `docs-sync-counter.js` Stop hook has (or may have) nudged you that a lot of source has
changed since the last docs sync. This command runs the actual sync.

Invoke the **docs-sync** subagent by name to update `docs/` for everything that changed since
the last sync, following ai-rules.md Rule 4. The subagent will:

1. Inspect `git diff` / `git status` to see what changed.
2. Map each change to the right doc and edit it.
3. Advance the sync marker (`.claude/.last-docs-sync` → current HEAD SHA) when it finishes,
   which resets the counter to zero.

Do not update the docs inline in the main conversation — always delegate to the docs-sync
subagent so the noisy diff-reading stays out of the main context and the marker is written
consistently.
