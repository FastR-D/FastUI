import { h, mergeProps, type FunctionalComponent, type HTMLAttributes } from 'vue'
export type Tone = 'info' | 'success' | 'warning' | 'danger'
export interface FeedbackProps extends HTMLAttributes { tone?: Tone }
export const Alert: FunctionalComponent<FeedbackProps> = (props, { attrs, slots }) =>
  h('div', mergeProps({ role: props.tone === 'danger' ? 'alert' : 'status' }, attrs, { class: ['fastui-alert', `fastui-tone-${props.tone ?? 'info'}`] }), slots.default?.())
Alert.props = ['tone']
Alert.inheritAttrs = false
export const Badge: FunctionalComponent<FeedbackProps> = (props, { attrs, slots }) =>
  h('span', mergeProps(attrs, { class: ['fastui-badge', `fastui-tone-${props.tone ?? 'info'}`] }), slots.default?.())
Badge.props = ['tone']
Badge.inheritAttrs = false
export const EmptyState: FunctionalComponent<HTMLAttributes & { title: string }> = (props, { attrs, slots }) =>
  h('div', mergeProps(attrs, { class: 'fastui-empty' }), [h('h2', props.title), slots.default?.(), slots.action?.()])
EmptyState.props = ['title']
EmptyState.inheritAttrs = false
export const Loading: FunctionalComponent<HTMLAttributes & { label?: string }> = (props, { attrs }) =>
  h('div', mergeProps({ role: 'status' }, attrs, { class: 'fastui-loading' }), [h('span', { class: 'fastui-spinner', 'aria-hidden': 'true' }), props.label ?? 'Loading'])
Loading.props = ['label']
Loading.inheritAttrs = false
