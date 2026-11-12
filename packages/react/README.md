# @fastrd/ui-react

MIT · 0.3.0 · React/ReactDOM ^18.3 or ^19 peers · exact foundation 0.3.0 registry dependency.


The recommended stylesheet integration is UnoCSS: add `UnoCSS()` to Vite and
`presetFastUI()` from `@fastrd/ui-foundation/uno` to `uno.config.ts`, then import
`virtual:uno.css` once in the application. The preset recognizes named/aliased
component imports, namespace access and native fastui classes. Use its `components`
option for runtime registries or wrapper libraries. Do not import the full CSS too.

**Removed in 0.3.0:** this package no longer generates or exports `styles.css`.
Remove the old import and configure UnoCSS. See `docs/MIGRATION.md` in the repository.

```tsx
import { Button, TextField, Dialog, Alert } from '@fastrd/ui-react'
import 'virtual:uno.css'

<TextField aria-label="Email" value={email} onChange={e=>setEmail(e.target.value)} />
<Alert tone="danger">Could not save. Check your connection and retry.</Alert>
<Dialog open={open} onClose={()=>setOpen(false)} label="Settings">
  <div className="fastui-modal-body"><Button onClick={()=>setOpen(false)}>Close</Button></div>
</Dialog>
```

Native controls forward refs and attributes. Button: variant
primary/secondary/quiet/icon/navigation/danger, size xs/sm/md, loading, disabled;
type defaults button. TextField size is density; htmlSize is the native input
size. TextArea, Checkbox, Select expose native textarea/input/select props;
Select takes option children, value/onChange and size density.

Dialog: controlled open/onClose request, label or labelledby, size md/lg/xl,
dismissible=true. Native browser modal behavior provides focus containment,
inert background, nested top layers and return focus. The component stays in
its original DOM tree to inherit scoped tokens. Use state changes to close;
native method=dialog forms are not the controlled API.

Alert and Badge: tone info/success/warning/danger. Alert defaults role=status,
or alert for danger. EmptyState takes title, children and action. Loading takes
label (default Loading) and exposes a status region. No product state, network
or authentication is included. Label icon buttons and all form fields through
normal aria-label or associated HTML labels.


## Workbench components

`TabBar`: `tabs`, `activeId`, accessible `label`, `onSelect` (Vue `@select`),
optional `onClose` (Vue `@close`), `closeLabel(tab)` and `dirtyLabel`.
Each TabItem has a unique DOM `id`, string `label`, optional `controls`,
`disabled`, `dirty`, `preview`. Host panels use `role="tabpanel"`, `id=controls`
and `aria-labelledby=activeId`; host owns visibility and active selection after
close. Automatic activation uses Left/Right, Home/End, RTL and disabled skipping.
Closing restores focus to the remaining tabbable tab. Empty/all-disabled lists
have no tabbable tab. Use unique ids across every instance.

`SegmentedControl`: `options` ({value,label,disabled?}), `value`, `label`,
`onChange` (Vue `@change`). A controlled mutually exclusive pressed-button group;
uses normal Tab order, not radio semantics.

`Toolbar` requires `label`; it groups mixed actions/fields with native Tab order.
`StatusBar` defaults role=status. `Section`, `ListRow`, `Divider` provide surfaces,
row separators and structure. ListRow is a noninteractive div by default; the
host owns selection, links, data, search and sorting.

Compact control sizes xs/sm/md are 24/25/28px. Typography uses the FastWrite
Plex/Noto stack with system fallback; fonts are loaded by the host, not the package.

## Editor surfaces (FastUI / FastWrite styling)

`ActivityRail` requires `label` and renders a nav; supply labelled native links
or `Button variant="navigation"` children. Use aria-pressed for tool toggles,
aria-current for navigation links, or aria-selected only inside a matching role.
`PanelHeader` is a flex div for a heading and optional count/actions.
`InspectorSection` requires `label`; it renders native details/summary with a
content grid. Omit `open` for browser-owned state; controlled consumers synchronize
`open` via the native toggle event. Do not nest interactive elements in its label.
`AssetCard` is a native button with `label`, optional `description`, `selected`,
`disabled` and native click handling. Selected maps to aria-pressed. React takes
`preview` content; Vue takes a `#preview` slot. Preview is decorative and must
contain only noninteractive content. The card defaults to type=button.
`CanvasSurface` renders a scrollable div with `grid=true`; `grid=false` disables
the dot pattern. Supply an accessible label and tabIndex/tabindex when scrollable.
Hosts own canvas content, zoom, drag/drop, data and panel layout.

All surfaces support scoped light/dark tokens, reduced motion and forced colors.
Use `--fastui-rail-width`, `--fastui-panel-header-height`, `--fastui-grid-size`,
`--fastui-grid-dot`, and the focus/shadow tokens to customize them.

Visual authority is the original FastUI / FastWrite foundation. FastPPT and
FastFigure inform component organization and interaction; their eventual visual
alignment follows this baseline. Editor surfaces inherit the same palette,
4/6/8px radii and compact controls, without a separate product theme.


## Mobile density

On coarse-pointer devices up to 900px wide, controls use 44px touch targets and
form inputs use 16px text. Desktop compact geometry and colors stay unchanged.
`data-fastui-density="touch"` / `"compact"` scopes the choice on any container.
Native dialog uses dynamic viewport height and safe-area insets on narrow screens;
tab strips scroll horizontally. Wrap wide tables in `.fastui-table-scroll` with an
accessible region label and tabindex. Hosts own mobile panel rearrangement.

Set top-level `content: fastUIContent` (exported from `@fastrd/ui-foundation/uno`)
to include plain JS/TS consumers in the UnoCSS Vite pipeline. Preset-local content
options alone do not expand the Vite filter. JSX/TSX/Vue/HTML are covered too.
