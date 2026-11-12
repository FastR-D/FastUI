import { forwardRef, type HTMLAttributes, type ReactNode, type ButtonHTMLAttributes, type DetailsHTMLAttributes } from 'react'
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
export const Toolbar = /* @__PURE__ */ forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { label: string }>(function Toolbar({ label, className = '', ...props }, ref) {
  return <div {...props} ref={ref} className={`fastui-toolbar ${className}`} role="group" aria-label={label} />
})
export const StatusBar = /* @__PURE__ */ forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function StatusBar({ className = '', ...props }, ref) {
  return <div role="status" {...props} ref={ref} className={`fastui-statusbar ${className}`} />
})
export const Section = /* @__PURE__ */ forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function Section({ className = '', ...props }, ref) {
  return <section {...props} ref={ref} className={`fastui-section ${className}`} />
})
export const Divider = /* @__PURE__ */ forwardRef<HTMLHRElement, HTMLAttributes<HTMLHRElement>>(function Divider({ className = '', ...props }, ref) {
  return <hr {...props} ref={ref} className={`fastui-divider ${className}`} />
})
export interface ListRowProps extends HTMLAttributes<HTMLDivElement> { children?: ReactNode }
export const ListRow = /* @__PURE__ */ forwardRef<HTMLDivElement, ListRowProps>(function ListRow({ className = '', ...props }, ref) {
  return <div {...props} ref={ref} className={`fastui-list-row ${className}`} />
})

/** Native navigation: supply labelled navigation buttons or links as children. */
export const ActivityRail = /* @__PURE__ */ forwardRef<HTMLElement, HTMLAttributes<HTMLElement> & { label: string }>(function ActivityRail({ label, className = '', ...props }, ref) {
  return <nav {...props} ref={ref} aria-label={label} className={`fastui-activity-rail ${className}`} />
})
export const PanelHeader = /* @__PURE__ */ forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function PanelHeader({ className = '', ...props }, ref) {
  return <div {...props} ref={ref} className={`fastui-panel-header ${className}`} />
})
export interface InspectorSectionProps extends DetailsHTMLAttributes<HTMLDetailsElement> { label: string }
/** Native disclosure; omit open for browser-owned state, or control it via onToggle. */
export const InspectorSection = /* @__PURE__ */ forwardRef<HTMLDetailsElement, InspectorSectionProps>(function InspectorSection({ label, children, className = '', ...props }, ref) {
  return <details {...props} ref={ref} className={`fastui-inspector-section ${className}`}><summary>{label}</summary><div className="fastui-inspector-body">{children}</div></details>
})
export interface AssetCardProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string
  description?: string
  preview?: ReactNode
  selected?: boolean
}
/** A selectable asset button. Preview content must be noninteractive. */
export const AssetCard = /* @__PURE__ */ forwardRef<HTMLButtonElement, AssetCardProps>(function AssetCard({ label, description, preview, selected, className = '', type = 'button', ...props }, ref) {
  return <button {...props} ref={ref} type={type} aria-pressed={selected ?? props['aria-pressed']} className={`fastui-asset-card ${className}`}>
    {preview != null && <span className="fastui-asset-preview" aria-hidden="true">{preview}</span>}
    <span className="fastui-asset-label">{label}</span>{description && <span className="fastui-asset-description">{description}</span>}
  </button>
})
export interface CanvasSurfaceProps extends HTMLAttributes<HTMLDivElement> { grid?: boolean }
export const CanvasSurface = /* @__PURE__ */ forwardRef<HTMLDivElement, CanvasSurfaceProps>(function CanvasSurface({ grid = true, className = '', ...props }, ref) {
  return <div {...props} ref={ref} className={`fastui-canvas ${grid ? 'fastui-canvas--grid' : ''} ${className}`} />
})
