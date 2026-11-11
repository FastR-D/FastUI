# @fastrd/ui-react

MIT · 0.2.0 · React/ReactDOM ^18.3 or ^19 peers · exact foundation 0.2.0 registry dependency.

```tsx
import { Button, TextField, Dialog, Alert } from '@fastrd/ui-react'
import '@fastrd/ui-react/styles.css'

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
