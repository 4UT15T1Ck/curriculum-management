# Testing Docs

Per-change test documentation. Each file here covers **one feature** or **one refactor**,
opens by listing the **automated tests** that already cover it, and then tabulates the
**manual** cases a human still has to walk — with the exact backend/service action needed to
trigger each one, where an action is needed.

This is the standing home for manual test docs. Prefer it over a single flat checklist: split
by feature/flow so a reader finds the tests for the thing they changed instead of scrolling
one long list.

---

## File-naming convention

```
feature__<slug>.md     a shipped feature — tests NEW behavior
refactor__<slug>.md     a refactor / internal change — tests PRESERVED behavior
```

- **`feature__`** — the behavior is new. Manual cases assert it does the right thing.
- **`refactor__`** — the behavior should be unchanged. Manual cases assert nothing regressed,
  plus any *newly surfaced* difference the refactor introduced on purpose.

`<slug>` is `kebab-case`, named after the flow or the change, not the ticket number. One file
= one feature or one refactor.

---

## What every file contains

Copy [`_TEMPLATE.md`](./_TEMPLATE.md) and fill it in. The fixed shape:

1. **Header** — type (Feature/Refactor), the branch/PR, and the source files under test.
2. **Automated coverage** — a table mapping each test file to what it covers and, crucially,
   the **gap it leaves for manual testing** (real UI, real network, real service errors —
   things a unit test mocks away).
3. **Manual test cases** — a numbered table: precondition → steps → expected result →
   **service action needed** → result checkbox. The action column is only filled where a case
   needs an external system driven into a state; most rows say `none`.
4. **Notes / known issues** — links to open code-review findings or error-log entries. A case
   documenting a **known-open bug** is marked `⚠️ known-issue`, not left as if it passes.

### Automated-coverage-first rule

The automated table comes **before** the manual table on purpose. A manual case a unit test
already covers deterministically is wasted human time — listing automated coverage first
scopes the manual walk down to what machines *can't* check.

### The Result column

- `☐` not run · `☑` pass · `✗` fail (explain in Notes) · `⚠️ known-issue` (link the finding —
  a *tracked* defect, not a pass, not a fresh failure).

---

## Backend / service actions

When a case needs an external system (API, DB, auth provider) driven into a state the app UI
can't produce on its own, the row names the action. Common ones for a client app talking to a
REST backend:

| Needed state | Action | Typical effect |
|---|---|---|
| Server unreachable | Stop the backend process, then act in-app | connection/server failure surface |
| 500 | Temporarily throw in the target endpoint | server-error surface |
| 401 | Expire/rotate the stored token | unauthorized / session-expired surface |
| 400 / 422 | Temporarily tighten request validation | validation-error surface (shows server message) |

Device-side states (airplane mode, low storage) need no backend action.

---

## Index

<!-- List each test-doc here, grouped Features / Refactors, one line each. -->

### Features
- …

### Refactors
- …

---

## Adding a new test-doc

1. Copy `_TEMPLATE.md` to `feature__<slug>.md` or `refactor__<slug>.md`.
2. Fill the header + source files.
3. List automated coverage first — scan the test suite for the feature's tests.
4. Write only the manual cases automation *can't* cover.
5. Add a line to the Index above.

(If the `test-doc` skill is installed, it scaffolds steps 1–2 and pre-seeds the
automated-coverage table by scanning the test suite.)
