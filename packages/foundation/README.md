# @fastrd/ui-foundation

MIT · 0.2.0 · Framework-independent ESM, types and explicitly imported CSS.

```js
import { initColorMode } from '@fastrd/ui-foundation'
import '@fastrd/ui-foundation/tokens.css'
import '@fastrd/ui-foundation/controls.css'
const theme = initColorMode({ storageKey: 'your-existing-preference-key' })
theme.setMode('system') // light | dark | system
// theme.subscribe(({ mode, resolved }) => ...); theme.dispose() on teardown
```

Call synchronously before mounting content. Optional `target` scopes the theme
(default document.documentElement). Storage denial is handled in memory; system
mode follows the OS and same-origin tabs synchronize. Only `data-fastui-theme`
is owned by this API. Imports are SSR-safe; initialization requires a browser.

`tokens.json` is the source for semantic colors, typography, compact dimensions,
motion and opt-in MDUI RGB mappings. `tokens.css` only defines variables;
`controls.css` only styles explicit `.fastui-*` classes. No app or native-input
reset. Framework controls, workbench chrome and HTML controls share these styles.

The default font stack is IBM Plex Sans Variable / Noto Sans SC Variable, with
system fallbacks. Hosts load fonts themselves or set `--fastui-font` to
`var(--fastui-font-system)`. Heights xs/sm/md are 24/25/28px; comfortable is 32px.
Reduced-motion disables transitions/spinner animation. Forced colors preserves
selected markers. Tokens are overridable within any container.

`mdui.css` is optional; mark only its integration root `.fastui-mdui`.
Use native `--fastui-*` tokens directly for custom integrations.

For static sites copy dist/index.js, color-mode.js, tokens.css and controls.css.
For initialization before parsing content, use
`<script src="./assets/color-mode.js" data-storage-key="your-existing-key"></script>`
in the head without async/defer. Native dialog stays in its original theme scope.

`tabNavigationIndex(key, index, items, rtl?)` is a framework-independent keyboard
helper used by both component packages. It handles Left/Right, Home/End,
wraparound and disabled items, returning -1 for unhandled keys/all-disabled lists.
It does not manage DOM focus or panels; HTML hosts implement those behaviors.
