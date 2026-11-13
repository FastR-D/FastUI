import { useRef, useState } from 'react'
import { Avatar, Button, Card, CardHeader, CardBody, CardFooter, Kbd, Progress, Skeleton, Switch } from '@fastrd/ui-react'
const picture = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#155fb8"/></svg>')
export function ContentCases() {
  const [checked, setChecked] = useState(false), [src, setSrc] = useState('data:image/png;base64,broken')
  const toggle = useRef<HTMLInputElement>(null)
  return <Card data-testid="content-cases"><CardHeader><h1>Content primitives</h1><Avatar name="Ada Lovelace" src={src} /><Avatar name="林知远" size="sm" /><Avatar name=" " size="lg" /></CardHeader><CardBody>
    <form data-testid="switch-form"><label>Auto save<Switch ref={toggle} name="auto" value="yes" checked={checked} onChange={event => setChecked(event.target.checked)} /></label><label>Uncontrolled<Switch name="native" defaultChecked /></label><label>Disabled<Switch name="disabled" disabled /></label><Button type="reset">Reset form</Button></form>
    <output data-testid="switch-state">{String(checked)}</output><Button onClick={() => toggle.current?.focus()}>Focus switch</Button><Button onClick={() => setSrc(picture)}>Load avatar</Button>
    <Progress label="Lower bound" value={-12} /><Progress label="Upper bound" max={10} value={30} /><Progress label="Unknown" /><Progress label="Invalid" max={0} value={NaN} /><Progress label="Ratio" max={1} value={0.5} />
    <Skeleton style={{ width: 120, height: 16 }} />
  </CardBody><CardFooter><Kbd>Ctrl</Kbd> + <Kbd>S</Kbd></CardFooter></Card>
}
