# Library API

```js
import { evaluateSkill, renderMarkdown } from "skill-acceptance-test-skill";

const result = evaluateSkill({ skillText, contract, fixtureDir });
console.log(renderMarkdown(result));
```

## `evaluateSkill({ skillText, contract, fixtureDir })`

Returns `status`, `summary`, `fixtureFiles`, and `findings`.

## `renderMarkdown(result)`

Returns a paste-ready Markdown acceptance report.
