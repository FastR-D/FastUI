import { StrictMode, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { WorkbenchCases } from './WorkbenchCases'
import { DialogCases } from './DialogCases'
import { initColorMode } from '@fastrd/ui-foundation'
import { Button, TextField, TextArea, Checkbox, Select, Dialog, Alert, Badge, EmptyState, Loading } from '@fastrd/ui-react'
import 'virtual:uno.css'
import './example.css'
const theme = initColorMode({ storageKey: 'fastui-example-mode' })
Object.assign(window, { theme })
function App() {
  const [name, setName] = useState('')
  const [checked, setChecked] = useState(false)
  const [format, setFormat] = useState('pdf')
  const [open, setOpen] = useState(false)
  const [nested, setNested] = useState(false)
  const [locked, setLocked] = useState(false)
  const [saved, setSaved] = useState(0)
  const nameRef = useRef<HTMLInputElement>(null)
  return <main className="workbench">
    <WorkbenchCases />
    <h1>Account settings</h1><p>Review your details and choose your export format.</p>
    <form onSubmit={e=>{e.preventDefault();setSaved(saved+1)}}>
      <label className="fastui-field">Name<TextField aria-label="Name" ref={nameRef} value={name} onChange={e=>setName(e.target.value)} required /></label>
      <output data-testid="name">{name}</output>
      <TextArea aria-label="Notes" defaultValue="" />
      <label><Checkbox aria-label="Include notes" checked={checked} onChange={e=>setChecked(e.target.checked)} /> Include notes</label>
      <output data-testid="checked">{String(checked)}</output>
      <Select aria-label="Format" value={format} onChange={e=>setFormat(e.target.value)}><option value="pdf">PDF</option><option value="svg">SVG</option><option value="png" disabled>PNG</option></Select>
      <output data-testid="format">{format}</output>
      <div className="toolbar"><Button type="submit" variant="primary">Save</Button><Button onClick={()=>setOpen(true)}>Open settings</Button><Button onClick={()=>setLocked(true)}>Open locked</Button><Button loading>Saving</Button><Button disabled>Unavailable</Button><Button onClick={()=>nameRef.current?.focus()}>Focus name</Button></div>
      <output data-testid="saved">{saved}</output>
    </form>
    <Alert tone="danger">Could not save. Check your connection and retry.</Alert><Badge tone="success">Connected</Badge>
    <EmptyState title="No exports yet" action={<Button onClick={()=>setOpen(true)}>Create export</Button>}><p>Choose a format to create your first export.</p></EmptyState><Loading label="Checking connection" />
    <div data-testid="preview"><input aria-label="Preview input" /><p>Preview content stays native.</p></div>
    <Dialog open={open} onClose={()=>setOpen(false)} label="Settings"><div className="fastui-modal-body"><h2>Settings</h2><TextField aria-label="Dialog name" autoFocus /><a href="#details">Details</a><Button onClick={()=>setNested(true)}>Open nested</Button><Button onClick={()=>setOpen(false)}>Close settings</Button></div>
      <Dialog open={nested} onClose={()=>setNested(false)} label="Nested settings"><div className="fastui-modal-body"><Button onClick={()=>setNested(false)}>Close nested</Button></div></Dialog>
    </Dialog>
    <Dialog open={locked} onClose={()=>setLocked(false)} dismissible={false} label="Locked settings"><div className="fastui-modal-body"><Button onClick={()=>setLocked(false)}>Unlock</Button></div></Dialog>
  </main>
}
createRoot(document.getElementById('app')!).render(<StrictMode>{new URLSearchParams(location.search).has('dialog-case') ? <DialogCases /> : <App />}</StrictMode>)
