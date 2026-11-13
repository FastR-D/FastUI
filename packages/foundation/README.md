# @fastrd/ui-foundation

MIT · 0.4.0 · Framework-independent ESM, types and explicitly imported CSS.

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

Editor HTML classes: `.fastui-activity-rail` (nav), `.fastui-panel-header` (div),
`.fastui-inspector-section` (details containing summary and
`.fastui-inspector-body`), `.fastui-asset-card` (button containing optional
`.fastui-asset-preview`, `.fastui-asset-label`, `.fastui-asset-description`),
`.fastui-canvas` with optional `.fastui-canvas--grid`. Asset previews are
decorative; use aria-hidden=true. Native buttons own disabled and aria-pressed.
These classes do not prescribe application panel layout or canvas behavior.


## UnoCSS (recommended for framework apps)

Install UnoCSS as a development dependency, enable `UnoCSS()` from `unocss/vite`,
then add `presetFastUI()` from `@fastrd/ui-foundation/uno` to your Uno configuration.
Import `virtual:uno.css` once, without importing full controls or framework CSS.
The preset works at build time and adds no browser runtime. It is available from 0.3.0.

The preset recognizes named component imports (including aliases), namespace
member access, and literal `fastui-*` HTML classes. It retains all states/variants
of used component families. For dynamically registered components or wrappers,
pass `components: ['Button', 'Modal']`. Tokens and shared density rules always
remain; unused dialog, tab, asset and other component CSS can be omitted.
The framework packages' full `styles.css` entries were removed in 0.3.0. Static HTML and consumers without UnoCSS may still use tokens/controls CSS.

## Touch density

`--fastui-touch-target` / `--fastui-touch-input-font-size` default to 0px, preserving
compact desktop geometry. Coarse-pointer devices up to 900px set them to 44px/16px.
`data-fastui-density="touch"` or `"compact"` overrides them locally, including
nested scopes. Checkbox/radio labels should use `.fastui-field` for a larger hit
area. Narrow dialogs use dynamic viewport limits and safe-area insets. Wide tables
can use `.fastui-table-scroll` with role=region, aria-label and tabindex=0.

Set top-level `content: fastUIContent` (exported from `@fastrd/ui-foundation/uno`)
to include plain JS/TS consumers in the UnoCSS Vite pipeline. Preset-local content
options alone do not expand the Vite filter. JSX/TSX/Vue/HTML are covered too.

## Refined surfaces and content classes

Buttons retain 4px corners via `--fastui-radius-button`. Controls/panels/overlays
use 8/12/16px. `--fastui-shadow-sm` and `--fastui-shadow-overlay` vary by theme.

Native HTML supports `.fastui-card` (variants --default/--secondary/--quiet),
`.fastui-card-header`, `.fastui-card-body`, `.fastui-card-footer`, `.fastui-avatar`
(sizes --sm/--md/--lg), `.fastui-switch` on input type=checkbox role=switch,
`.fastui-progress` on progress, `.fastui-skeleton` on an aria-hidden div and
`.fastui-kbd` on kbd. Avatars contain initials and an optional decorative img;
plain HTML hosts handle image errors. Label switches and progress; use aria-busy
on the loading container. Progress max should be explicit in plain HTML to match
the React/Vue default of 100. Motion and forced-colors rules are included.
