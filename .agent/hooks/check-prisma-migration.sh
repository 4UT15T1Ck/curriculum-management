#!/bin/bash
# Enforces nestjs-rules.md #3: schema.prisma changes must be paired with a migration.
# Registered as a PostToolUse hook on the Edit|Write matcher. Runs after the edit lands so it
# flags the violation for Claude to act on in the same turn -- it cannot prevent the write itself.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only care about schema.prisma edits
if [[ "$FILE_PATH" != *"schema.prisma" ]]; then
  exit 0
fi

# Check whether a new migration directory was created recently (within this session is unknowable
# from the hook, so we check if prisma/migrations exists and has at least one migration).
MIGRATIONS_DIR="$(dirname "$FILE_PATH")/../migrations"
MIGRATIONS_DIR=$(realpath "$MIGRATIONS_DIR" 2>/dev/null)

if [[ ! -d "$MIGRATIONS_DIR" ]] || [[ -z "$(ls -A "$MIGRATIONS_DIR" 2>/dev/null)" ]]; then
  echo "schema.prisma was edited but no migrations directory found at $MIGRATIONS_DIR. Run 'prisma migrate dev --name <description>' to create a migration before committing this change." >&2
  exit 2
fi

# Warn that a migration is likely needed -- can't auto-detect whether it was already created
echo "schema.prisma was edited. Confirm that you have run 'prisma migrate dev --name <description>' and that a new migration file exists in prisma/migrations/ before finishing this task." >&2
exit 1
