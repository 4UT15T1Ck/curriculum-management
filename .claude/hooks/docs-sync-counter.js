#!/usr/bin/env node
// Stop hook: passively tracks how much SOURCE code has changed since the last docs sync,
// and nudges the user to run a sync only once the change is large enough to matter.
//
// This replaces the old `type:"prompt"` Stop hook, which spent model tokens EVERY turn to
// ask "do docs need updating?". This version costs zero model tokens: like context-usage.js,
// it reports via the hook `systemMessage` field (shown to the user, never injected into the
// model's context).
//
// "Since last sync" is measured against a marker file the docs-sync subagent writes when it
// finishes (.claude/.last-docs-sync, containing the HEAD commit SHA at sync time). The counter
// sums changed lines (added + deleted) across source files — excluding docs/ and .claude/ —
// between that marker commit and the current working tree (committed + uncommitted).
//
// Written in Node rather than bash+jq because jq is not on PATH in every environment
// (e.g. stock Git Bash on Windows) — same reason as protect-sensitive-files.sh's fallback.
// Must never break a session: any failure exits 0 with no output.

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Below this many changed source lines since last sync, stay silent.
const NUDGE_THRESHOLD_LINES = 150;
// At or above this, escalate the wording — the sync is well overdue.
const OVERDUE_THRESHOLD_LINES = 400;
// Marker file the docs-sync agent writes on completion (relative to project root).
const MARKER_RELATIVE_PATH = '.claude/.last-docs-sync';
// Path prefixes whose changes are NOT "source" and must not count toward the nudge.
const NON_SOURCE_PREFIXES = ['docs/', '.claude/'];

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function git(cwd, args) {
  // Returns stdout as string, or null on any failure (not a git repo, bad ref, etc.).
  try {
    return execSync(`git ${args}`, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

function projectRoot(cwd) {
  const out = git(cwd, 'rev-parse --show-toplevel');
  return out ? out.trim() : null;
}

function readMarkerSha(root) {
  try {
    const raw = fs.readFileSync(path.join(root, MARKER_RELATIVE_PATH), 'utf8').trim();
    // Marker file's first token is the commit SHA; ignore any trailing timestamp/comment.
    const sha = raw.split(/\s+/)[0];
    return sha || null;
  } catch {
    return null;
  }
}

function isSourceFile(filePath) {
  return !NON_SOURCE_PREFIXES.some((prefix) => filePath.startsWith(prefix));
}

// Sums added+deleted lines over source files from `git diff --numstat <range>`.
function countChangedLines(root, range) {
  const out = git(root, `diff --numstat ${range}`);
  if (!out) return 0;
  let total = 0;
  for (const line of out.split('\n')) {
    if (!line.trim()) continue;
    // Format: "<added>\t<deleted>\t<path>". Binary files show "-\t-\t<path>".
    const parts = line.split('\t');
    if (parts.length < 3) continue;
    const [addedRaw, deletedRaw, filePath] = parts;
    if (!isSourceFile(filePath.trim())) continue;
    const added = parseInt(addedRaw, 10);
    const deleted = parseInt(deletedRaw, 10);
    if (!Number.isNaN(added)) total += added;
    if (!Number.isNaN(deleted)) total += deleted;
  }
  return total;
}

function main() {
  const hookInput = JSON.parse(readStdin() || '{}');
  const cwd = hookInput.cwd || process.cwd();

  const root = projectRoot(cwd);
  if (!root) return; // not a git repo — nothing to measure against

  const markerSha = readMarkerSha(root);

  // If there's no marker yet (docs never synced in this project), compare against HEAD so the
  // counter still measures uncommitted work rather than silently doing nothing forever.
  const range = markerSha ? markerSha : 'HEAD';
  const changed = countChangedLines(root, range);
  if (changed < NUDGE_THRESHOLD_LINES) return;

  const sinceText = markerSha
    ? 'since the last docs sync'
    : 'since HEAD (no docs sync recorded yet)';
  let message = `docs: ~${changed} lines of source changed ${sinceText} — consider /sync-docs`;
  if (changed >= OVERDUE_THRESHOLD_LINES) {
    message += ' (well overdue)';
  }
  console.log(JSON.stringify({ systemMessage: message }));
}

try {
  main();
} catch {
  // Silent by design: a broken sync counter must never block or noise up a session.
}
