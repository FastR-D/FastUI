import { useCallback, useRef, useState } from 'react'
import { Button, Dialog } from '@fastrd/ui-react'

export function DialogCases() {
  const mode = new URLSearchParams(location.search).get('dialog-case')
  const [parent, setParent] = useState(true)
  const [child, setChild] = useState(true)
  const [mounted, setMounted] = useState(true)
  const [renders, setRenders] = useState(0)
  const [generation, setGeneration] = useState(0)
  const [requests, setRequests] = useState<string[]>([])
  const events = useRef<string[]>([])
  Object.assign(window, { refEvents: events.current })
  const callback = useCallback((node: HTMLDialogElement | null) => {
    events.current.push(node ? `attach:${generation}` : `null:${generation}`)
    if (node && mode === 'ref-cleanup') return () => { events.current.push(`cleanup:${generation}`) }
  }, [generation, mode])
  if (mode === 'stack') return <main className="workbench">
    <output data-testid="requests">{requests.join(',')}</output>
    <Dialog open={parent} label="Initial parent" onClose={()=>{setRequests(value=>[...value, 'parent']);setParent(false)}}>
      <Button autoFocus>Parent focus</Button>
      <Dialog open={child} label="Initial child" onClose={()=>{setRequests(value=>[...value, 'child']);setChild(false)}}>
        <Button autoFocus>Child focus</Button>
      </Dialog>
    </Dialog>
  </main>
  return <main className="workbench">
    <Button onClick={()=>setRenders(value=>value+1)}>Rerender</Button>
    <Button onClick={()=>setGeneration(value=>value+1)}>Replace ref</Button>
    <Button onClick={()=>setMounted(false)}>Unmount</Button>
    <output>{renders}</output>
    {mounted && <Dialog ref={callback} open={false} label="Ref lifecycle" onClose={()=>{}} />}
  </main>
}
