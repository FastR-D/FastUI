# @fastrd/ui-react

MIT · 0.1.1 · React/ReactDOM ^18.3 or ^19 peers · exact foundation 0.1.1 registry dependency.

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
