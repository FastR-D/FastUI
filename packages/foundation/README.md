# @fastrd/ui-foundation

MIT · 0.1.0 · Framework-independent ESM, types and explicitly imported CSS.

```js
import { initColorMode } from '@fastrd/ui-foundation'
import '@fastrd/ui-foundation/tokens.css'
import '@fastrd/ui-foundation/controls.css'
const theme = initColorMode({ storageKey: 'your-existing-preference-key' })
theme.setMode('system') // light | dark | system
// theme.subscribe(({ mode, resolved }) => ...); theme.dispose() on teardown
```

Call synchronously before mounting content. `target` optionally scopes the theme
to an HTMLElement; it defaults to document.documentElement. Storage denial is
handled in memory. Changes follow the OS in system mode and synchronize across
same-origin tabs. `data-fastui-theme` is the only DOM attribute owned by this API.
Imports are SSR-safe; initialization requires a browser.

tokens.json is the single editable source for light/dark colors, dimensions,
MDUI RGB channel mappings and vscrui aliases. `tokens.css` only defines variables;
`controls.css` only styles explicitly marked `.fastui-*` controls. No body/app
reset, inherited font reset or descendant native-input selector. Put
`.fastui-button`, `.fastui-input`, `.fastui-textarea`, `.fastui-select` on individual
HTML controls. Variant and size classes use `--primary` / `--sm`, etc.

Import `mdui.css` or `vscrui.css` explicitly and mark only their integration root
`.fastui-mdui` / `.fastui-vscrui`. Do not mark an editor subtree for mappings
unless the editor is intentionally meant to consume those variables.
Native dialog enters the top layer without leaving its theme scope.

For static sites copy dist/index.js, color-mode.js, tokens.css and controls.css
from this version's package. For initialization before content is parsed, put
`<script src="./assets/color-mode.js" data-storage-key="your-existing-key"></script>`
in the head without async/defer. The ES module index.js also exports the controller
for application initialization and scoped panels. No CDN or runtime framework is required.
