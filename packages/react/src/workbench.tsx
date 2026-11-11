import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { tabNavigationIndex } from '@fastrd/ui-foundation'

export interface TabItem {
  /** Unique DOM id, also used by the panel's aria-labelledby. */
  id: string
  label: string
  controls?: string
  disabled?: boolean
  dirty?: boolean
  preview?: boolean
}
export interface TabBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  tabs: readonly TabItem[]
  activeId: string | null
  onSelect: (id: string) => void
  label: string
  onClose?: (id: string) => void
  closeLabel?: (tab: TabItem) => string
  dirtyLabel?: string
}
/** Controlled, automatically activated tabs. Host owns panel visibility and close state. */
export function TabBar({ tabs, activeId, onSelect, label, onClose, closeLabel = tab => `Close ${tab.label}`, dirtyLabel = 'Unsaved changes', className = '', ...props }: TabBarProps) {
  const focusId = tabs.find(tab => tab.id === activeId && !tab.disabled)?.id ?? tabs.find(tab => !tab.disabled)?.id
  return <div {...props} className={`fastui-tabs ${onClose ? 'fastui-tabs--closable' : ''} ${className}`} role="group" aria-label={`${label} controls`}>
    <div role="tablist" aria-label={label} aria-owns={tabs.map(tab => tab.id).join(' ') || undefined} />
    {tabs.map((tab, index) => <div className="fastui-tab-item" key={tab.id}>
      <button type="button" id={tab.id} role="tab" aria-selected={tab.id === activeId} aria-controls={tab.controls}
        disabled={tab.disabled} tabIndex={tab.id === focusId ? 0 : -1} className={`fastui-tab ${tab.preview ? 'fastui-tab--preview' : ''}`}
        onClick={() => onSelect(tab.id)} onKeyDown={event => {
          if (event.nativeEvent.isComposing) return
          const next = tabNavigationIndex(event.key, index, tabs, getComputedStyle(event.currentTarget).direction === 'rtl')
          if (next < 0) return
          event.preventDefault()
          onSelect(tabs[next].id)
          const root = event.currentTarget.closest('.fastui-tabs')!
          const button = root.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]
          button?.focus()
          button?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
        }}>
        <span className="fastui-tab-label">{tab.label}</span>
        {tab.dirty && <span className="fastui-tab-dirty" role="img" aria-label={dirtyLabel} />}
      </button>
      {onClose && <button type="button" className="fastui-tab-close" aria-label={closeLabel(tab)} disabled={tab.disabled} onClick={event => {
        const root = event.currentTarget.closest('.fastui-tabs')!
        onClose(tab.id)
        requestAnimationFrame(() => { if (root.isConnected) root.querySelector<HTMLButtonElement>('[role="tab"][tabindex="0"]')?.focus() })
      }}>×</button>}
    </div>)}
  </div>
}
export interface SegmentedOption { value: string; label: string; disabled?: boolean }
export interface SegmentedControlProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: readonly SegmentedOption[]
  value: string
  onChange: (value: string) => void
  label: string
}
export function SegmentedControl({ options, value, onChange, label, className = '', ...props }: SegmentedControlProps) {
  return <div {...props} className={`fastui-segments ${className}`} role="group" aria-label={label}>
    {options.map(option => <button type="button" key={option.value} className="fastui-segment" disabled={option.disabled}
      aria-pressed={option.value === value} onClick={() => onChange(option.value)}>{option.label}</button>)}
  </div>
}
/** An action group. Native Tab order is preserved for mixed form controls. */
export const Toolbar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { label: string }>(function Toolbar({ label, className = '', ...props }, ref) {
  return <div {...props} ref={ref} className={`fastui-toolbar ${className}`} role="group" aria-label={label} />
})
export const StatusBar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function StatusBar({ className = '', ...props }, ref) {
  return <div role="status" {...props} ref={ref} className={`fastui-statusbar ${className}`} />
})
export const Section = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function Section({ className = '', ...props }, ref) {
  return <section {...props} ref={ref} className={`fastui-section ${className}`} />
})
export const Divider = forwardRef<HTMLHRElement, HTMLAttributes<HTMLHRElement>>(function Divider({ className = '', ...props }, ref) {
  return <hr {...props} ref={ref} className={`fastui-divider ${className}`} />
})
export interface ListRowProps extends HTMLAttributes<HTMLDivElement> { children?: ReactNode }
export const ListRow = forwardRef<HTMLDivElement, ListRowProps>(function ListRow({ className = '', ...props }, ref) {
  return <div {...props} ref={ref} className={`fastui-list-row ${className}`} />
})
