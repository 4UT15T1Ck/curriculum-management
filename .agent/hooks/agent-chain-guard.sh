#!/bin/bash
# Tracks Agent-tool spawns for the current session and warns (does not block) on the two
# anti-patterns real session logs showed: re-running the full build-verifier ->
# architecture-reviewer -> docs-sync chain more than once per ticket, and re-spawning Explore
# for a question/description already covered this session. See context-management-rules.md.
# Registered as a PostToolUse hook on the Agent matcher.
# Exit 1 = advisory warning (Claude sees it, can choose to act). Exit 2 is never used here —
# "same ticket vs. new ticket" is a heuristic call, not something safe to hard-block on.

INPUT=$(cat)

if command -v jq >/dev/null 2>&1; then
  SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
  SUBAGENT_TYPE=$(echo "$INPUT" | jq -r '.tool_input.subagent_type // "general-purpose"')
  DESCRIPTION=$(echo "$INPUT" | jq -r '.tool_input.description // empty')
else
  # jq is not on PATH in every environment (e.g. stock Git Bash on Windows).
  SESSION_ID=$(printf '%s' "$INPUT" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
  SUBAGENT_TYPE=$(printf '%s' "$INPUT" | sed -n 's/.*"subagent_type"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
  DESCRIPTION=$(printf '%s' "$INPUT" | sed -n 's/.*"description"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
  [ -z "$SESSION_ID" ] && SESSION_ID="unknown"
  [ -z "$SUBAGENT_TYPE" ] && SUBAGENT_TYPE="general-purpose"
fi

STATE_DIR="${TMPDIR:-/tmp}/claude-agent-chain-guard"
mkdir -p "$STATE_DIR"
STATE_FILE="$STATE_DIR/$SESSION_ID.log"
touch "$STATE_FILE"

NORM_DESC=$(printf '%s' "$DESCRIPTION" | tr '[:upper:]' '[:lower:]' | tr -s '[:space:]' ' ')

WARN=""

if [[ "$SUBAGENT_TYPE" == "architecture-reviewer" || "$SUBAGENT_TYPE" == "docs-sync" ]]; then
  PRIOR_COUNT=$(grep -c "|${SUBAGENT_TYPE}|" "$STATE_FILE" 2>/dev/null)
  PRIOR_COUNT=${PRIOR_COUNT:-0}
  if [[ "$PRIOR_COUNT" -ge 1 ]]; then
    RUN_NUM=$((PRIOR_COUNT + 1))
    WARN="This is run #$RUN_NUM of '$SUBAGENT_TYPE' this session. Per context-management-rules.md, the full build-verifier -> architecture-reviewer -> docs-sync chain should run once per ticket (on the round the ticket is actually done) -- mid-ticket fix rounds should use build-verifier only. If review keeps finding the same issue, fix it inline and ask the user instead of re-spawning the chain again."
  fi
fi

if [[ "$SUBAGENT_TYPE" == "Explore" && -n "$NORM_DESC" ]]; then
  while IFS='|' read -r _ts _type prev_desc; do
    [[ "$_type" != "Explore" || -z "$prev_desc" ]] && continue
    if [[ "$prev_desc" == "$NORM_DESC" || "$prev_desc" == *"$NORM_DESC"* || "$NORM_DESC" == *"$prev_desc"* ]]; then
      WARN="This Explore prompt looks like a near-duplicate of one already run this session (\"$prev_desc\"). Per context-management-rules.md, reuse that result or resume the same agent instead of re-deriving it."
      break
    fi
  done < "$STATE_FILE"
fi

echo "$(date +%s)|${SUBAGENT_TYPE}|${NORM_DESC}" >> "$STATE_FILE"

if [[ -n "$WARN" ]]; then
  echo "$WARN" >&2
  exit 1
fi

exit 0
