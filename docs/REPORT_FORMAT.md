# Report Format

Reports contain:

- `status`: `pass` or `fail`
- `summary`: pass and fail counts
- `fixtureFiles`: local fixture files counted for the run
- `findings`: individual acceptance checks

Markdown reports use the same finding IDs as JSON so reviewers can discuss failures without copying the full machine-readable output. Pipes in table cells are escaped and line breaks are rendered as `<br>` so finding IDs and messages cannot change the table structure. JSON output retains the original values.
