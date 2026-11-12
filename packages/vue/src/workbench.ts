import { h, mergeProps, nextTick, type FunctionalComponent, type HTMLAttributes, type ButtonHTMLAttributes, type DetailsHTMLAttributes } from 'vue'
import { tabNavigationIndex } from '@fastrd/ui-foundation'

export interface TabItem { id: string; label: string; controls?: string; disabled?: boolean; dirty?: boolean; preview?: boolean }
export interface TabBarProps {
  tabs: readonly TabItem[]
  activeId: string | null
  onSelect: (id: string) => void
  label: string
  onClose?: (id: string) => void
  closeLabel?: (tab: TabItem) => string
  dirtyLabel?: string
}
export const TabBar = /* @__PURE__ */ (() => {
  const TabBar: FunctionalComponent<TabBarProps> = (props, { attrs }) => {
    const focusId = props.tabs.find(tab => tab.id === props.activeId && !tab.disabled)?.id ?? props.tabs.find(tab => !tab.disabled)?.id
    return h('div', mergeProps(attrs, { class: ['fastui-tabs', props.onClose && 'fastui-tabs--closable'], role: 'group', 'aria-label': `${props.label} controls` }), [
      h('div', { role: 'tablist', 'aria-label': props.label, 'aria-owns': props.tabs.map(tab => tab.id).join(' ') || undefined }),
      ...props.tabs.map((tab, index) => h('div', { key: tab.id, class: 'fastui-tab-item' }, [
        h('button', { type: 'button', id: tab.id, role: 'tab', disabled: tab.disabled,
          'aria-selected': tab.id === props.activeId, 'aria-controls': tab.controls, tabindex: tab.id === focusId ? 0 : -1,
          class: ['fastui-tab', tab.preview && 'fastui-tab--preview'], onClick: () => props.onSelect(tab.id),
          onKeydown: (event: KeyboardEvent) => {
            if (event.isComposing) return
            const target = event.currentTarget as HTMLButtonElement
            const next = tabNavigationIndex(event.key, index, props.tabs, getComputedStyle(target).direction === 'rtl')
            if (next < 0) return
            event.preventDefault()
            props.onSelect(props.tabs[next].id)
            const button = target.closest('.fastui-tabs')?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]
            button?.focus()
            button?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
          },
        }, [h('span', { class: 'fastui-tab-label' }, tab.label), tab.dirty ? h('span', { class: 'fastui-tab-dirty', role: 'img', 'aria-label': props.dirtyLabel ?? 'Unsaved changes' }) : null]),
        props.onClose ? h('button', { type: 'button', class: 'fastui-tab-close', disabled: tab.disabled,
          'aria-label': props.closeLabel?.(tab) ?? `Close ${tab.label}`, onClick: (event: MouseEvent) => {
            const root = (event.currentTarget as HTMLElement).closest('.fastui-tabs')!
            props.onClose?.(tab.id)
            void nextTick(() => { if (root.isConnected) root.querySelector<HTMLButtonElement>('[role="tab"][tabindex="0"]')?.focus() })
          } }, '×') : null,
      ])),
    ])
  }
  TabBar.props = ['tabs', 'activeId', 'onSelect', 'label', 'onClose', 'closeLabel', 'dirtyLabel']
  TabBar.inheritAttrs = false
  return TabBar
})()
export interface SegmentedOption { value: string; label: string; disabled?: boolean }
export interface SegmentedControlProps { options: readonly SegmentedOption[]; value: string; onChange: (value: string) => void; label: string }
export const SegmentedControl = /* @__PURE__ */ (() => {
  const SegmentedControl: FunctionalComponent<SegmentedControlProps> = (props, { attrs }) =>
    h('div', mergeProps(attrs, { class: 'fastui-segments', role: 'group', 'aria-label': props.label }), props.options.map(option =>
      h('button', { type: 'button', key: option.value, class: 'fastui-segment', disabled: option.disabled,
        'aria-pressed': option.value === props.value, onClick: () => props.onChange(option.value) }, option.label)))
  SegmentedControl.props = ['options', 'value', 'onChange', 'label']
  SegmentedControl.inheritAttrs = false
  return SegmentedControl
})()
export const Toolbar = /* @__PURE__ */ (() => {
  const Toolbar: FunctionalComponent<HTMLAttributes & { label: string }> = (props, { attrs, slots }) =>
    h('div', mergeProps(attrs, { class: 'fastui-toolbar', role: 'group', 'aria-label': props.label }), slots.default?.())
  Toolbar.props = ['label']
  Toolbar.inheritAttrs = false
  return Toolbar
})()

export const ActivityRail = /* @__PURE__ */ (() => {
  const ActivityRail: FunctionalComponent<HTMLAttributes & { label: string }> = (props, { attrs, slots }) =>
    h('nav', mergeProps(attrs, { class: 'fastui-activity-rail', 'aria-label': props.label }), slots.default?.())
  ActivityRail.props = ['label']
  ActivityRail.inheritAttrs = false
  return ActivityRail
})()
export const PanelHeader = /* @__PURE__ */ (() => {
  const PanelHeader: FunctionalComponent<HTMLAttributes> = (_props, { attrs, slots }) =>
    h('div', mergeProps(attrs, { class: 'fastui-panel-header' }), slots.default?.())
  PanelHeader.inheritAttrs = false
  return PanelHeader
})()
export interface InspectorSectionProps extends DetailsHTMLAttributes { label: string }
export const InspectorSection = /* @__PURE__ */ (() => {
  const InspectorSection: FunctionalComponent<InspectorSectionProps> = (props, { attrs, slots }) =>
    h('details', mergeProps(attrs, { class: 'fastui-inspector-section' }), [
      h('summary', props.label), h('div', { class: 'fastui-inspector-body' }, slots.default?.()),
    ])
  InspectorSection.props = ['label']
  InspectorSection.inheritAttrs = false
  return InspectorSection
})()
export interface AssetCardProps extends ButtonHTMLAttributes { label: string; description?: string; selected?: boolean }
/** Noninteractive artwork belongs in #preview. Native click/disabled semantics. */
export const AssetCard = /* @__PURE__ */ (() => {
  const AssetCard: FunctionalComponent<AssetCardProps> = (props, { attrs, slots }) =>
    h('button', mergeProps(attrs, { type: props.type ?? 'button', class: 'fastui-asset-card', 'aria-pressed': props.selected ?? attrs['aria-pressed'] }), [
      slots.preview ? h('span', { class: 'fastui-asset-preview', 'aria-hidden': 'true' }, slots.preview()) : null,
      h('span', { class: 'fastui-asset-label' }, props.label),
      props.description ? h('span', { class: 'fastui-asset-description' }, props.description) : null,
    ])
  AssetCard.props = ['label', 'description', 'selected', 'type']
  AssetCard.inheritAttrs = false
  return AssetCard
})()
export interface CanvasSurfaceProps extends HTMLAttributes { grid?: boolean }
export const CanvasSurface = /* @__PURE__ */ (() => {
  const CanvasSurface: FunctionalComponent<CanvasSurfaceProps> = (props, { attrs, slots }) =>
    h('div', mergeProps(attrs, { class: ['fastui-canvas', props.grid !== false && 'fastui-canvas--grid'] }), slots.default?.())
  CanvasSurface.props = ['grid']
  CanvasSurface.inheritAttrs = false
  return CanvasSurface
})()
