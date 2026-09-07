# Library API

```js
import { evaluateSkill, renderMarkdown } from "skill-acceptance-test-skill";

const result = evaluateSkill({ skillText, contract, fixtureDir });
console.log(renderMarkdown(result));
```

## `evaluateSkill({ skillText, contract, fixtureDir })`

Returns `status`, `summary`, `fixtureFiles`, and `findings`.

`fixtureFiles` contains sorted paths relative to `fixtureDir` itself. For example, a file at
`<fixtureDir>/happy/input.json` is reported as `happy/input.json`. The paths do not depend on the
process working directory.

## `renderMarkdown(result)`

Returns a paste-ready Markdown acceptance report.
