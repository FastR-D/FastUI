import { useState } from 'react'
import { TabBar, SegmentedControl, Toolbar, StatusBar } from '@fastrd/ui-react'
const initial = [
  { id: 'work-source', label: 'Source', controls: 'work-panel', dirty: true },
  { id: 'work-disabled', label: 'Disabled file', controls: 'work-panel', disabled: true },
  { id: 'work-notes', label: 'Notes file', controls: 'work-panel' },
]
export function WorkbenchCases() {
  const [tabs, setTabs] = useState(initial), [active, setActive] = useState('work-source'), [filter, setFilter] = useState('all')
  return <section aria-label="Workbench components">
    <TabBar tabs={tabs} activeId={active} label="Files" onSelect={setActive} onClose={id => {
      const next = tabs.filter(tab => tab.id !== id)
      setTabs(next)
      if (id === active) setActive(next.find(tab => !tab.disabled)?.id ?? '')
    }} />
    <div role="tabpanel" id="work-panel" aria-labelledby={active || undefined} aria-label={active ? undefined : 'No file'} tabIndex={0}>{active || 'No file'}</div>
    <Toolbar label="Source controls"><SegmentedControl label="Source filter" value={filter} onChange={setFilter} options={[{ value: 'all', label: 'All sources' }, { value: 'local', label: 'Local sources' }, { value: 'locked', label: 'Locked sources', disabled: true }]} /></Toolbar>
    <StatusBar aria-label="Source status">{filter}</StatusBar>
  </section>
}
