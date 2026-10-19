<!--
Copy this file to feature__<slug>.md or refactor__<slug>.md and fill it in.
Delete these comment blocks as you go. Add the new file to README.md's Index.
-->

# [Feature|Refactor] <Title>

**Type:** Feature | Refactor
**Branch / PR:** <branch or PR#>
**Source files under test:**
- `<path>`
- `<path>`

<!-- One line on what this covers and — for a refactor — what behavior must stay identical. -->
<Short description of the change and the testing intent.>

---

## Automated coverage

<!--
List the test files that already exercise this code. The Gap column is the point:
what does the unit test mock away that only a human on a real device/service can confirm?
-->

| Test file | What it covers | Gap (needs manual) |
|---|---|---|
| `<test path>` | … | … |

---

## Manual test cases

<!--
Precondition → Steps → Expected → Service action → Result.
- Service action: `none` unless an external system must be driven into a state (down / 401 / 422 / 500).
  See README "Backend / service actions".
- Result: ☐ not run · ☑ pass · ✗ fail (explain in Notes) · ⚠️ known-issue (link finding).
-->

| # | Precondition | Steps | Expected result | Service action needed | Result |
|---|---|---|---|---|---|
| 1 | … | … | … | none | ☐ |

---

## Notes / known issues

<!-- Link open code-review findings or error-log entries for any ⚠️ known-issue row. -->
- …
